/**
 * Copyright (c) 2021-present, NDLA.
 *
 * This source code is licensed under the GPLv3 license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useFormikContext } from "formik";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import styled from "@emotion/styled";
import { spacing } from "@ndla/core";
import { ImageSearch } from "@ndla/image-search";
import { Button, FieldsetLegend, FieldsetRoot } from "@ndla/primitives";
import { IImageMetaInformationV3 } from "@ndla/types-backend/image-api";
import { useImageSearchTranslations } from "@ndla/ui";
import { LocaleType } from "../../../interfaces";
import { fetchImage, postSearchImages, onError } from "../../../modules/image/imageApi";
import MetaImageField from "../../FormikForm/components/MetaImageField";
import { ConceptFormValues } from "../conceptInterfaces";

const StyledTitleDiv = styled.div`
  margin-bottom: ${spacing.small};
`;

interface Props {
  name: string;
  disableAltEditing?: boolean;
  hideAltText?: boolean;
}

const InlineImageSearch = ({ name, disableAltEditing, hideAltText }: Props) => {
  const { t, i18n } = useTranslation();
  const { setFieldValue, values, setFieldTouched } = useFormikContext<ConceptFormValues>();
  const [image, setImage] = useState<IImageMetaInformationV3 | undefined>();
  const imageSearchTranslations = useImageSearchTranslations();
  const locale: LocaleType = i18n.language;
  const fetchImageWithLocale = (id: number) => fetchImage(id, locale);
  const searchImagesWithParameters = (query?: string, page?: number) => {
    return postSearchImages({ query, page, pageSize: 16 });
  };

  useEffect(() => {
    (async () => {
      if (values.metaImageId) {
        const image = await fetchImageWithLocale(parseInt(values.metaImageId));
        setImage(image);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (image) {
    return (
      <MetaImageField
        disableAltEditing={disableAltEditing}
        hideAltText={hideAltText}
        image={image}
        onImageRemove={() => {
          setFieldValue(name, undefined);
          setFieldValue("metaImageAlt", undefined, true);
          setImage(undefined);
        }}
        showRemoveButton
      />
    );
  }
  return (
    <FieldsetRoot>
      <FieldsetLegend textStyle="label.medium">{t("form.metaImage.title")}</FieldsetLegend>
      <ImageSearch
        fetchImage={fetchImageWithLocale}
        searchImages={searchImagesWithParameters}
        locale={locale}
        translations={imageSearchTranslations}
        onImageSelect={(image: IImageMetaInformationV3) => {
          setFieldValue(name, image.id);
          setFieldValue("metaImageAlt", image.alttext.alttext.trim(), true);
          setImage(image);
          setTimeout(() => {
            setFieldTouched("metaImageAlt", true, true);
            setFieldTouched(name, true, true);
          }, 0);
        }}
        noResults={
          <>
            <StyledTitleDiv>{t("imageSearch.noResultsText")}</StyledTitleDiv>
            <Button type="submit">{t("imageSearch.noResultsButtonText")}</Button>
          </>
        }
        onError={onError}
      />
    </FieldsetRoot>
  );
};

export default InlineImageSearch;
