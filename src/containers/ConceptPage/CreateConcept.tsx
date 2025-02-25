/**
 * Copyright (c) 2019-present, NDLA.
 *
 * This source code is licensed under the GPLv3 license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { HelmetWithTracker } from "@ndla/tracker";
import { INewConcept } from "@ndla/types-backend/concept-api";
import ConceptForm from "./ConceptForm/ConceptForm";
import { toEditConcept } from "../../util/routeHelpers";
import { useFetchConceptData } from "../FormikForm/formikConceptHooks";

interface Props {
  inModal?: boolean;
  addConceptInModal?: Function;
}

const CreateConcept = ({ inModal = false, addConceptInModal }: Props) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { subjects, createConcept, conceptArticles } = useFetchConceptData(undefined, i18n.language);

  const onCreate = useCallback(
    async (createdConcept: INewConcept) => {
      const savedConcept = await createConcept(createdConcept);
      if (inModal && addConceptInModal) {
        addConceptInModal(savedConcept);
      } else {
        navigate(toEditConcept(savedConcept.id, createdConcept.language));
      }
      return savedConcept;
    },
    [addConceptInModal, createConcept, inModal, navigate],
  );

  return (
    <>
      <HelmetWithTracker title={t(`conceptForm.title`)} />
      <ConceptForm
        language={i18n.language}
        upsertProps={{ onCreate }}
        inModal={inModal}
        subjects={subjects}
        conceptArticles={conceptArticles}
        supportedLanguages={[i18n.language]}
      />
    </>
  );
};

export default CreateConcept;
