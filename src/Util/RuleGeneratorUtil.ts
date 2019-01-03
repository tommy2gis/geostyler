import * as Color from 'color';
import { Data } from 'geostyler-data';
import {
  LevelOfMeasurement
} from 'src/Component/RuleGenerator/RuleGenerator';
import {
  Rule,
  Filter,
  SymbolizerKind,
  Symbolizer,
  WellKnownName
} from 'geostyler-style';
import SymbolizerUtil from './SymbolizerUtil';
import {
  scale as chromaScale,
  limits as chromaLimits,
  InterpolationMode
}  from 'chroma-js';
import { ClassificationMethod } from 'src/Component/RuleGenerator/ClassificationCombo/ClassificationCombo';

// Unsure if we can rely on this file in future releases

const _get = require('lodash/get');

export interface RuleGenerationParams {
  data: Data;
  levelOfMeasurement: LevelOfMeasurement;
  numberOfRules: number;
  attributeName: string;
  colors: string[];
  colorSpace?: InterpolationMode;
  symbolizerKind: SymbolizerKind;
  wellKnownName?: WellKnownName;
  classificationMethod?: ClassificationMethod;
}

/**
 * @class RuleUtil
 */
class RuleGeneratorUtil {

  static getDistinctValues(data: Data, attributeName: string): any[] {
    let distinctValues: any[] = [];
    const attributeType = _get(data, `schema.properties[${attributeName}].type`);
    const features = _get(data, 'exampleFeatures.features');
    if (features) {
      if (attributeType === 'string') {
        features.forEach((feature: any) => {
          const value = _get(feature, `properties[${attributeName}]`);
          if (value && !distinctValues.includes(value)) {
            distinctValues.push(value);
          }
        });
        return distinctValues;
      }
      // TODO Implement logic for others than string. Maybe we don't even want to
      // allow this
      return distinctValues;
    }
    return distinctValues;
  }

  static guessSymbolizerFromData(data: Data): SymbolizerKind {
    const firstFeatureGeometryType: GeoJSON.GeoJsonGeometryTypes
      = _get(data, 'exampleFeatures.features[0].geometry.type');

    switch (firstFeatureGeometryType) {
      case 'Point':
      case 'MultiPoint':
        return 'Mark';
      case 'LineString':
      case 'MultiLineString':
        return 'Line';
      case 'Polygon':
      case 'MultiPolygon':
        return 'Fill';
      default:
        return 'Mark';
    }
  }

  static generateColors(colors: string[], numberOfRules: number, colorSpace: InterpolationMode = 'hsl'): string[] {
    return chromaScale(colors).mode(colorSpace).colors(numberOfRules);
  }

  static generateRules(params: RuleGenerationParams): Rule[] {
    const {
      data,
      levelOfMeasurement,
      attributeName,
      colors: inputColors,
      colorSpace,
      symbolizerKind,
      wellKnownName,
      classificationMethod
    } = params;
    let numberOfRules = params.numberOfRules;

    let colors = RuleGeneratorUtil.generateColors(inputColors, numberOfRules, colorSpace);

    let rules: Rule[] = [];
    if (levelOfMeasurement === 'nominal') {
      const distinctValues = RuleGeneratorUtil.getDistinctValues(data, attributeName);
      distinctValues.splice(numberOfRules, distinctValues.length - 2);
      rules = distinctValues.map((distinctValue, index: number) => {
        const filter: Filter = ['==', attributeName, distinctValue];
        const symbolizer: Symbolizer = SymbolizerUtil.generateSymbolizer(symbolizerKind, {
          color: colors[index],
          wellKnownName
        });
        return {
          name: distinctValue,
          filter,
          symbolizers: [symbolizer]
        };
      });
    } else if (levelOfMeasurement === 'cardinal') {
      if (!classificationMethod) {
        // TODO Add feedback
      } else {
        const features = _get(data, 'exampleFeatures.features');
        const values = features ? features.map((feature: any) => {
            return _get(feature, `properties[${attributeName}]`);
          }) : [];
        let ranges: number[][] = [];

        switch (classificationMethod) {
          case 'equalInterval':
            ranges = RuleGeneratorUtil.getRanges(values, numberOfRules, 'e');
            break;
          case 'quantile':
            ranges = RuleGeneratorUtil.getRanges(values, numberOfRules, 'q');
            break;
          case 'logarithmic':
            ranges = RuleGeneratorUtil.getRanges(values, numberOfRules, 'l');
            break;
          case 'kmeans':
            ranges = RuleGeneratorUtil.getRanges(values, numberOfRules, 'k');
            numberOfRules = ranges.length;
            colors = RuleGeneratorUtil.generateColors(inputColors, numberOfRules, colorSpace);
            break;
          default:
            break;
        }

        rules = ranges.map((range, index: number) => {
          const isLast = index === ranges.length - 1;
          const filter: Filter = [
            '&&',
            ['>=', attributeName, range[0]],
            [isLast ? '<=' : '<', attributeName,  range[1]],
          ];
          const symbolizer: Symbolizer = SymbolizerUtil.generateSymbolizer(symbolizerKind, {
            color: colors[index],
            wellKnownName
          });
          return {
            name: `${attributeName} ${range[0]} - ${range[1]}`,
            filter,
            symbolizers: [symbolizer]
          };
        });
      }
    }
    return rules;
  }

  static generateBackgroundStyleFromColors = (colors: string[]) => {
    const gradients = colors.map((color: string) => `linear-gradient(${color}, ${color})`);
    const backgroundImage = gradients.join(',');
    const size = colors.map((color: string, index: number) => {
      const width = (index + 1) * (100 / colors.length);
      return `${width}% 100%`;
    });
    const backgroundSize = size.join(',');
    const textColor = Color(colors[0]).isLight() ? '#000000' : '#FFFFFF';
    return {
      backgroundImage: backgroundImage,
      backgroundSize: backgroundSize,
      backgroundRepeat: 'no-repeat',
      color: textColor
    };
  }

  /**
   * Get Ranges for quantile spread statistic.
   *
   * @param {number[]} series The data values.
   * @param {number} numberOfClasses The number of classes to generate.
   * @param {'e'|'q'|'l'|'k'} mode The mode in which the ranges should be generated:
   *  - e: equidistant
   *  - q: quantile
   *  - l: logarihtmic
   *  - k: k-means
   */
  static getRanges(series: number[], numberOfClasses: number, mode: 'e' | 'q' | 'l' | 'k' = 'e') {
    const bounds = chromaLimits(series, mode, numberOfClasses);
    return RuleGeneratorUtil.boundsToRanges(bounds);
  }

  /**
   * Inspired by GeoStats.js: http://www.intermezzo-coop.eu/mapping/geostats/
   *
   * @param {number[]} bounds An array of class boundary values.
   */
  static boundsToRanges(bounds: number[]): number[][] {
    let ranges = [];
    for (let i = 0; i < (bounds.length - 1); i++) {
      ranges[i] = [bounds[i], bounds[i + 1]];
    }
    return ranges;
  }

}

export default RuleGeneratorUtil;