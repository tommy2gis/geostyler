/*
 * @Author: shitao
 * @Date: 2024-03-29 15:06:51
 * @LastEditTime: 2024-04-02 09:05:53
 * @LastEditors: shitao
 * @Description: 
 * @FilePath: \geostyler\src\Component\Symbolizer\SymbolizerEditorWindow\SymbolizerEditorWindow.tsx
 * 无锡四维时空信息科技有限公司
 */
/* Released under the BSD 2-Clause License
 *
 * Copyright © 2018-present, terrestris GmbH & Co. KG and GeoStyler contributors
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * * Redistributions of source code must retain the above copyright notice,
 *   this list of conditions and the following disclaimer.
 *
 * * Redistributions in binary form must reproduce the above copyright notice,
 *   this list of conditions and the following disclaimer in the documentation
 *   and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

import React from 'react';

import { Symbolizer } from 'geostyler-style';

import { MultiEditor } from '../MultiEditor/MultiEditor';
import { IconLibrary } from '../IconSelector/IconSelector';

import './SymbolizerEditorWindow.less';
import { Drawer,DrawerProps} from 'antd';


import _isEqual from 'lodash/isEqual';
import { useGeoStylerLocale } from '../../../context/GeoStylerContext/GeoStylerContext';


// non default props
export interface SymbolizerEditorWindowProps extends Partial<DrawerProps> {
  symbolizers: Symbolizer[];
  onClose?: () => void;
  onSymbolizersChange?: (symbolizers: Symbolizer[]) => void;
  iconLibraries?: IconLibrary[];
  colorRamps?: {
    [name: string]: string[];
  };
}

export const SymbolizerEditorWindow: React.FC<SymbolizerEditorWindowProps> = ({
  symbolizers,
  onClose,
  onSymbolizersChange,
  iconLibraries,
  colorRamps,
  ...passThroughProps
}) => {

  const locale = useGeoStylerLocale('SymbolizerEditorWindow');

  return (
    <Drawer
      className="symbolizer-editor-modal"
      rootClassName='symbolizer-editor-drawer'
      title={locale.symbolizersEditor}
      onClose={onClose}
      width={500}
      footer={false}
      mask={false}
      {...passThroughProps}
    >
      <MultiEditor
        symbolizers={symbolizers}
        onSymbolizersChange={onSymbolizersChange}
        iconLibraries={iconLibraries}
        editorProps={{ colorRamps }}
      />
    </Drawer>
  );
};
