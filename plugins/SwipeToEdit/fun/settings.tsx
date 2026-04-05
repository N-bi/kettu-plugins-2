import { Forms } from "@kettu/ui/components";

const { FormSection, FormRow, FormRadioRow } = Forms;

const ACTION_OPTIONS = [
  { label: "Reply", value: "reply" },
  { label: "Edit", value: "edit" },
  { label: "Delete", value: "delete" },
];

export default function Settings({ settings }) {
  return (
    <>
      <FormSection title="Swipe Right Action">
        {ACTION_OPTIONS.map((opt) => (
          <FormRadioRow
            key={opt.value}
            label={opt.label}
            selected={settings.rightAction === opt.value}
            onPress={() => (settings.rightAction = opt.value)}
          />
        ))}
      </FormSection>

      <FormSection title="Swipe Left Action">
        {ACTION_OPTIONS.map((opt) => (
          <FormRadioRow
            key={opt.value}
            label={opt.label}
            selected={settings.leftAction === opt.value}
            onPress={() => (settings.leftAction = opt.value)}
          />
        ))}
      </FormSection>
    </>
  );
}
