/*
 * @Author: shitao
 * @Date: 2024-03-29 15:06:51
 * @LastEditTime: 2024-04-07 13:40:20
 * @LastEditors: shitao
 * @Description: 
 * @FilePath: \geostyler\src\Component\Symbolizer\Field\FontPicker\FontPicker.tsx
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

import {
  Select
} from 'antd';

// default props
interface FontPickerDefaultProps {
  fontOptions: string[];
}

// non default props
export interface FontPickerProps extends Partial<FontPickerDefaultProps> {
  onChange?: (fonts: string[]) => void;
  font?: string[];
}

/**
 * FontPicker to select font types / families
 */
export const FontPicker: React.FC<FontPickerProps> = ({
  onChange,
  font,
  fontOptions = [
    '微软雅黑', '微软雅黑 Bold', '微软雅黑 Light',
    '宋体', '新宋体', '仿宋',
    '楷体', '黑体','monospace', 'fantasy', 'serif', 'sans-serif'
  ]
}) => {

  let options: {label: string; value: string}[];
  if (fontOptions) {
    options = fontOptions.map((fontOpt: string) => {
      return {
        label: fontOpt,
        value: fontOpt
      };
    });
  }

  return (
    <Select
      className="editor-field font-picker"
      mode="tags"
      value={font}
      onChange={onChange}
      options={options}
    />
  );
};
