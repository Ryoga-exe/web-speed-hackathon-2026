import { ChangeEvent, useCallback, useMemo, useState } from "react";

import { AuthFormData } from "@web-speed-hackathon-2026/client/src/auth/types";
import { validate } from "@web-speed-hackathon-2026/client/src/auth/validation";
import { FormInputField } from "@web-speed-hackathon-2026/client/src/components/foundation/FormInputField";
import { Link } from "@web-speed-hackathon-2026/client/src/components/foundation/Link";
import { ModalErrorMessage } from "@web-speed-hackathon-2026/client/src/components/modal/ModalErrorMessage";
import { ModalSubmitButton } from "@web-speed-hackathon-2026/client/src/components/modal/ModalSubmitButton";

interface Props {
  onRequestCloseModal: () => void;
  onSubmit: (values: AuthFormData) => Promise<void>;
}

const AuthModalPageComponent = ({
  onRequestCloseModal,
  onSubmit,
}: Props) => {
  const [values, setValues] = useState<AuthFormData>({
    type: "signin",
    username: "",
    name: "",
    password: "",
  });
  const [touched, setTouched] = useState<Partial<Record<keyof AuthFormData, boolean>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const errors = useMemo(() => validate(values), [values]);
  const isDisabled =
    submitting ||
    Object.values(errors).some((value) => value != null) ||
    values.username.trim() === "" ||
    values.password.trim() === "" ||
    (values.type === "signup" && values.name.trim() === "");

  const handleChangeField = useCallback(
    (field: keyof AuthFormData) => (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.currentTarget.value;
      setValues((current) => ({ ...current, [field]: value }));
      setTouched((current) => ({ ...current, [field]: true }));
      setSubmitError(null);
    },
    [],
  );

  const handleToggleType = useCallback(() => {
    setValues((current) => ({
      ...current,
      type: current.type === "signin" ? "signup" : "signin",
    }));
    setTouched({});
    setSubmitError(null);
  }, []);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const nextTouched: Partial<Record<keyof AuthFormData, boolean>> = {
        password: true,
        username: true,
      };
      if (values.type === "signup") {
        nextTouched.name = true;
      }
      setTouched((current) => ({ ...current, ...nextTouched }));

      if (Object.values(validate(values)).some((value) => value != null)) {
        return;
      }

      setSubmitting(true);
      setSubmitError(null);
      try {
        await onSubmit(values);
      } catch (error) {
        setSubmitError(error instanceof Error ? error.message : "サインインに失敗しました");
      } finally {
        setSubmitting(false);
      }
    },
    [onSubmit, values],
  );

  const type = values.type;

  return (
    <form className="grid gap-y-6" onSubmit={handleSubmit}>
      <h2 className="text-center text-2xl font-bold">
        {type === "signin" ? "サインイン" : "新規登録"}
      </h2>

      <div className="flex justify-center">
        <button
          className="text-cax-brand underline"
          onClick={handleToggleType}
          type="button"
        >
          {type === "signin" ? "初めての方はこちら" : "サインインはこちら"}
        </button>
      </div>

      <div className="grid gap-y-2">
        <FormInputField
          autoComplete="username"
          error={touched.username ? errors.username : undefined}
          label="ユーザー名"
          leftItem={<span className="text-cax-text-subtle leading-none">@</span>}
          name="username"
          onChange={handleChangeField("username")}
          value={values.username}
        />

        {type === "signup" && (
          <FormInputField
            autoComplete="nickname"
            error={touched.name ? errors.name : undefined}
            label="名前"
            name="name"
            onChange={handleChangeField("name")}
            value={values.name}
          />
        )}

        <FormInputField
          autoComplete={type === "signup" ? "new-password" : "current-password"}
          error={touched.password ? errors.password : undefined}
          label="パスワード"
          name="password"
          onChange={handleChangeField("password")}
          type="password"
          value={values.password}
        />
      </div>

      {type === "signup" ? (
        <p>
          <Link className="text-cax-brand underline" onClick={onRequestCloseModal} to="/terms">
            利用規約
          </Link>
          に同意して
        </p>
      ) : null}

      <ModalSubmitButton disabled={isDisabled} loading={submitting}>
        {type === "signin" ? "サインイン" : "登録する"}
      </ModalSubmitButton>

      <ModalErrorMessage>{submitError}</ModalErrorMessage>
    </form>
  );
};

export const AuthModalPage = AuthModalPageComponent;
