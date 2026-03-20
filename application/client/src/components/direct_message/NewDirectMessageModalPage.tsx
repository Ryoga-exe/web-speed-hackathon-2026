import { ChangeEvent, useCallback, useMemo, useState } from "react";

import { Button } from "@web-speed-hackathon-2026/client/src/components/foundation/Button";
import { FormInputField } from "@web-speed-hackathon-2026/client/src/components/foundation/FormInputField";
import { ModalErrorMessage } from "@web-speed-hackathon-2026/client/src/components/modal/ModalErrorMessage";
import { ModalSubmitButton } from "@web-speed-hackathon-2026/client/src/components/modal/ModalSubmitButton";
import { NewDirectMessageFormData } from "@web-speed-hackathon-2026/client/src/direct_message/types";
import { validate } from "@web-speed-hackathon-2026/client/src/direct_message/validation";

interface Props {
  id: string;
  onSubmit: (values: NewDirectMessageFormData) => Promise<void>;
}

const NewDirectMessageModalPageComponent = ({
  id,
  onSubmit,
}: Props) => {
  const [values, setValues] = useState<NewDirectMessageFormData>({ username: "" });
  const [touched, setTouched] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const errors = useMemo(() => validate(values), [values]);
  const isDisabled = submitting || errors.username != null;

  const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setValues({ username: event.currentTarget.value });
    setTouched(true);
    setSubmitError(null);
  }, []);

  const handleBlur = useCallback(() => {
    setTouched(true);
  }, []);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setTouched(true);
      if (validate(values).username != null) {
        return;
      }

      setSubmitting(true);
      setSubmitError(null);
      try {
        await onSubmit(values);
      } catch (error) {
        setSubmitError(error instanceof Error ? error.message : "ユーザーが見つかりませんでした");
      } finally {
        setSubmitting(false);
      }
    },
    [onSubmit, values],
  );

  return (
    <div className="grid gap-y-6">
      <h2 className="text-center text-2xl font-bold">新しくDMを始める</h2>

      <form className="flex flex-col gap-y-6" onSubmit={handleSubmit}>
        <FormInputField
          error={touched ? errors.username : undefined}
          label="ユーザー名"
          leftItem={<span className="text-cax-text-subtle leading-none">@</span>}
          name="username"
          onBlur={handleBlur}
          onChange={handleChange}
          placeholder="username"
          value={values.username}
        />

        <div className="grid gap-y-2">
          <ModalSubmitButton disabled={isDisabled} loading={submitting}>
            DMを開始
          </ModalSubmitButton>
          <Button variant="secondary" command="close" commandfor={id}>
            キャンセル
          </Button>
        </div>

        <ModalErrorMessage>{submitError}</ModalErrorMessage>
      </form>
    </div>
  );
};

export const NewDirectMessageModalPage = NewDirectMessageModalPageComponent;
