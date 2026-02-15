import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import ChevronDownIcon from "@/assets/icons/chevron-down.svg?react";

interface OptionProps {
  value?: string;
  children?: React.ReactNode;
}

// Parse <option> children. Options with value="" are treated as placeholder-only (not rendered).
// Radix disallows value="" on SelectItem, so we skip those and use their label for placeholder.
function parseOptions(
  children: React.ReactNode,
): { value: string; label: string }[] {
  const options: { value: string; label: string }[] = [];
  React.Children.forEach(children, (child) => {
    if (React.isValidElement<OptionProps>(child) && child.type === "option") {
      const props = child.props;
      const value = props.value ?? "";
      const label =
        typeof props.children === "string"
          ? props.children
          : String(props.children ?? "");
      options.push({ value, label });
    }
  });
  return options;
}

export interface SelectProps {
  value?: string;
  onChange?: (e: { target: { value: string } }) => void;
  children?: React.ReactNode;
  className?: string;
  id?: string;
  disabled?: boolean;
  placeholder?: string;
}

const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      className,
      value,
      onChange,
      children,
      id,
      disabled,
      placeholder,
      ...props
    },
    ref,
  ) => {
    const options = React.useMemo(() => parseOptions(children), [children]);
    const placeholderOption = options.find((o) => o.value === "");
    const selectableOptions = options.filter((o) => o.value !== "");
    const placeholderText =
      placeholder ?? placeholderOption?.label ?? "Selecione";

    // When value is "", pass "" so Radix shows placeholder (no matching SelectItem)
    const radixValue = value ?? "";

    return (
      <SelectPrimitive.Root
        value={radixValue}
        onValueChange={(val) => onChange?.({ target: { value: val } })}
        disabled={disabled}
      >
        <SelectPrimitive.Trigger
          ref={ref}
          id={id}
          type="button"
          className={cn(
            "flex h-12 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
            (!value || value === "") && "text-gray-500",
            className,
          )}
          {...props}
        >
          <SelectPrimitive.Value placeholder={placeholderText} />
          <SelectPrimitive.Icon asChild>
            <ChevronDownIcon className="h-4 w-4 shrink-0 opacity-50" />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>
        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            className={cn(
              "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-xl border border-gray-200 bg-white text-foreground shadow-md",
              "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
            )}
            position="popper"
            sideOffset={4}
          >
            <SelectPrimitive.Viewport className="p-1">
              {selectableOptions.map((opt) => (
                <SelectPrimitive.Item
                  key={opt.value}
                  value={opt.value}
                  className={cn(
                    "relative flex w-full cursor-default select-none items-center rounded-lg py-2.5 pl-3 pr-9 text-sm outline-none",
                    "focus:bg-gray-100 focus:text-foreground data-[highlighted]:bg-gray-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                  )}
                >
                  <SelectPrimitive.ItemText className="truncate">
                    {opt.label}
                  </SelectPrimitive.ItemText>
                  <span className="absolute right-2 flex h-4 w-4 items-center justify-center">
                    <SelectPrimitive.ItemIndicator>
                      <Check
                        className="h-4 w-4 text-[#1D7A5E]"
                        strokeWidth={2.5}
                      />
                    </SelectPrimitive.ItemIndicator>
                  </span>
                </SelectPrimitive.Item>
              ))}
            </SelectPrimitive.Viewport>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
    );
  },
);
Select.displayName = "Select";

export { Select };
