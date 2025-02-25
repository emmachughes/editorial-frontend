/**
 * Copyright (c) 2024-present, NDLA.
 *
 * This source code is licensed under the GPLv3 license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { Descendant, Editor, Element } from "slate";
import { jsx as slatejsx } from "slate-hyperscript";
import { TYPE_COPYRIGHT } from "./types";
import { createEmbedTagV2, reduceElementDataAttributesV2 } from "../../../../util/embedTagHelpers";
import { SlateSerializer } from "../../interfaces";
import { NormalizerConfig, defaultBlockNormalizer } from "../../utils/defaultNormalizer";
import {
  afterOrBeforeTextBlockElement,
  firstTextBlockElement,
  lastTextBlockElement,
  textBlockElements,
} from "../../utils/normalizationHelpers";
import { TYPE_NDLA_EMBED } from "../embed/types";
import { TYPE_FRAMED_CONTENT } from "../framedContent/types";
import { TYPE_PARAGRAPH } from "../paragraph/types";

export const copyrightSerializer: SlateSerializer = {
  deserialize(el: HTMLElement, children: Descendant[]) {
    if (el.tagName.toLowerCase() !== TYPE_NDLA_EMBED) return;
    const embed = el as HTMLEmbedElement;
    const embedAttributes = reduceElementDataAttributesV2(Array.from(embed.attributes));
    if (embedAttributes.resource !== TYPE_COPYRIGHT) return;
    return slatejsx(
      "element",
      { type: TYPE_COPYRIGHT, data: { ...embedAttributes, copyright: JSON.parse(embedAttributes.copyright) } },
      children,
    );
  },
  serialize(node: Descendant, children: JSX.Element[]) {
    if (!Element.isElement(node) || node.type !== TYPE_COPYRIGHT || !node.data) return;
    return createEmbedTagV2({ ...node.data, copyright: JSON.stringify(node.data.copyright) }, children, undefined);
  },
};

const normalizerConfig: NormalizerConfig = {
  nodes: {
    allowed: textBlockElements,
    defaultType: TYPE_PARAGRAPH,
  },
  firstNode: {
    allowed: firstTextBlockElement,
    defaultType: TYPE_PARAGRAPH,
  },
  lastNode: {
    allowed: lastTextBlockElement,
    defaultType: TYPE_PARAGRAPH,
  },
  previous: {
    allowed: afterOrBeforeTextBlockElement,
    defaultType: TYPE_PARAGRAPH,
  },
  next: {
    allowed: afterOrBeforeTextBlockElement,
    defaultType: TYPE_PARAGRAPH,
  },
};

export const copyrightPlugin = (editor: Editor) => {
  const { normalizeNode: nextNormalizeNode } = editor;

  editor.normalizeNode = (entry) => {
    const [node] = entry;

    if (Element.isElement(node) && node.type === TYPE_COPYRIGHT) {
      if (!defaultBlockNormalizer(editor, entry, normalizerConfig)) {
        return nextNormalizeNode(entry);
      }
    } else {
      nextNormalizeNode(entry);
    }
  };

  return editor;
};
