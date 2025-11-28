export const componentInfo = {
	button: {
		description:
			"Use this component to implement clickable buttons with different visual styles and sizes.",
		example: `<Button variant="default" size="default">Click me</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline" size="sm">Small Outline</Button>
<Button variant="ghost" size="icon"><IconComponent /></Button>`,
		props: {
			variant: {
				type: '"default" | "destructive" | "outline" | "secondary" | "ghost" | "link"',
				default: '"default"',
				description: "Visual style variant of the button",
			},
			size: {
				type: '"default" | "sm" | "lg" | "icon" | "icon-sm" | "icon-lg"',
				default: '"default"',
				description: "Size of the button",
			},
			asChild: {
				type: "boolean",
				default: "false",
				description: "Render as a child component using Radix Slot",
			},
			className: {
				type: "string",
				description: "Additional CSS classes",
			},
		},
	},
	input: {
		description:
			"Use this component to implement text input fields with built-in styling for focus, validation, and file inputs.",
		example: `<Input type="text" placeholder="Enter text" />
<Input type="email" placeholder="Email address" />
<Input type="password" placeholder="Password" />
<Input type="file" />`,
		props: {
			type: {
				type: "string",
				description: "HTML input type (text, email, password, file, etc.)",
			},
			className: {
				type: "string",
				description: "Additional CSS classes",
			},
			placeholder: {
				type: "string",
				description: "Placeholder text",
			},
		},
	},
	form: {
		description:
			"Use these components to build forms with react-hook-form integration. Form wraps FormProvider, FormField wraps Controller, and other components provide accessible form structure.",
		example: `<Form {...form}>
  <FormField
    control={form.control}
    name="username"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Username</FormLabel>
        <FormControl>
          <Input {...field} />
        </FormControl>
        <FormDescription>Enter your username</FormDescription>
        <FormMessage />
      </FormItem>
    )}
  />
</Form>`,
		components: {
			Form: {
				description:
					"Root form component, wraps FormProvider from react-hook-form",
				props: "Accepts all FormProvider props from react-hook-form",
			},
			FormField: {
				description:
					"Wraps Controller from react-hook-form for field management",
				props: {
					control: "Control object from useForm",
					name: "Field name",
					render: "Render function that receives field props",
				},
			},
			FormItem: {
				description: "Container for form field with proper spacing",
				props: {
					className: "Additional CSS classes",
				},
			},
			FormLabel: {
				description: "Label for form field, automatically shows error state",
				props: {
					className: "Additional CSS classes",
				},
			},
			FormControl: {
				description:
					"Wrapper for form input element, provides accessibility attributes",
				props: "Accepts Slot props",
			},
			FormDescription: {
				description: "Helper text for form field",
				props: {
					className: "Additional CSS classes",
				},
			},
			FormMessage: {
				description: "Displays validation error message",
				props: {
					className: "Additional CSS classes",
				},
			},
		},
	},
	select: {
		description:
			"Use these components to implement dropdown select menus. Select is the root, SelectTrigger opens the menu, SelectContent contains options, and SelectItem represents each option.",
		example: `<Select>
  <SelectTrigger size="default">
    <SelectValue placeholder="Select option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>`,
		components: {
			Select: {
				description: "Root select component",
				props: {
					value: "Controlled value",
					onValueChange: "Callback when value changes",
					defaultValue: "Default value for uncontrolled mode",
				},
			},
			SelectTrigger: {
				description: "Button that opens the select menu",
				props: {
					size: {
						type: '"sm" | "default"',
						default: '"default"',
						description: "Size of the trigger button",
					},
					className: "Additional CSS classes",
				},
			},
			SelectValue: {
				description: "Displays the selected value",
				props: {
					placeholder: "Placeholder text when no value selected",
				},
			},
			SelectContent: {
				description: "Container for select options",
				props: {
					position: {
						type: '"popper" | "item-aligned"',
						default: '"popper"',
						description: "Positioning strategy",
					},
					align: {
						type: '"start" | "center" | "end"',
						default: '"center"',
						description: "Alignment relative to trigger",
					},
				},
			},
			SelectItem: {
				description: "Individual select option",
				props: {
					value: "Value of the option (required)",
					className: "Additional CSS classes",
				},
			},
			SelectGroup: {
				description: "Groups related select items",
			},
			SelectLabel: {
				description: "Label for a select group",
			},
			SelectSeparator: {
				description: "Visual separator between items",
			},
		},
	},
	switch: {
		description:
			"Use this component to implement toggle switches for boolean on/off states.",
		example: `<Switch checked={isEnabled} onCheckedChange={setIsEnabled} />
<Switch defaultChecked />
<Switch disabled />`,
		props: {
			checked: {
				type: "boolean",
				description: "Controlled checked state",
			},
			onCheckedChange: {
				type: "(checked: boolean) => void",
				description: "Callback when checked state changes",
			},
			defaultChecked: {
				type: "boolean",
				description: "Default checked state for uncontrolled mode",
			},
			disabled: {
				type: "boolean",
				description: "Whether the switch is disabled",
			},
			className: {
				type: "string",
				description: "Additional CSS classes",
			},
		},
	},
	label: {
		description:
			"Use this component to implement accessible labels for form inputs. Automatically handles disabled states and peer relationships.",
		example: `<Label htmlFor="email">Email</Label>
<Input id="email" type="email" />`,
		props: {
			htmlFor: {
				type: "string",
				description: "ID of the input element this label is for",
			},
			className: {
				type: "string",
				description: "Additional CSS classes",
			},
		},
	},
};

export const UI_SYSTEM_PROMPT = `You are generating React components using Shadcn UI components. Follow these rules:

AVAILABLE COMPONENTS:
- Button: Use for clickable actions (submit, cancel, delete, etc.). Props: variant, size, asChild
- Input: Use for text entry fields. Props: type, placeholder, className
- Label: Use to label form inputs. Always pair with Input using htmlFor and id
- Switch: Use for boolean toggles (enable/disable features). Props: checked, onCheckedChange, defaultChecked
- Select: Use for dropdown menus with multiple options. Structure: Select > SelectTrigger > SelectValue + SelectContent > SelectItem
- Form: Use for forms with validation. Structure: Form > FormField > FormItem > FormLabel + FormControl + FormDescription + FormMessage. Requires react-hook-form

RULES:
1. Always use the exact component names and structure shown above
2. For forms, always wrap inputs in FormControl and use FormField with render prop
3. For selects, always include SelectValue inside SelectTrigger
4. Match Label htmlFor with Input id for accessibility
5. Use appropriate variant/size props for visual hierarchy
6. Keep code clean and minimal

Generate only valid React/TypeScript code with proper component composition.`;
