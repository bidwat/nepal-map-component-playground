interface CheckboxFieldProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (nextValue: boolean) => void;
}

export function CheckboxField({
  id,
  label,
  checked,
  onChange,
}: CheckboxFieldProps) {
  return (
    <div className="fieldRow checkboxRow">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
    </div>
  );
}
