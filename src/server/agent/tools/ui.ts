export const UI = `<Accordion type="single" collapsible>
  <AccordionItem value="item-1">
    <AccordionTrigger>Is it accessible?</AccordionTrigger>
    <AccordionContent>Yes. It adheres to the WAI-ARIA design pattern.</AccordionContent>
  </AccordionItem>
</Accordion>

<AlertDialog>
  <AlertDialogTrigger>Open</AlertDialogTrigger>
  <AlertDialogContent>Content goes here</AlertDialogContent>
</AlertDialog>


<Alert>This is an alert</Alert>


<AspectRatio ratio={16 / 9}>
<img src="..." alt="Image" />
</AspectRatio>


<Avatar>
  <AvatarImage src="..." alt="User" />
  <AvatarFallback>U</AvatarFallback>
</Avatar>


<Badge>Badge</Badge>


<Breadcrumb>
  <BreadcrumbItem>Home</BreadcrumbItem>
</Breadcrumb>


<Button>Button</Button>


<ButtonGroup>
  <Button>One</Button>
  <Button>Two</Button>
</ButtonGroup>


<Calendar />


<Card>Card content</Card>


<Carousel>
  <CarouselItem>Slide 1</CarouselItem>
</Carousel>


<Chart data={[]} />


<Checkbox />


<Collapsible>
  <CollapsibleTrigger>Toggle</CollapsibleTrigger>
  <CollapsibleContent>Content</CollapsibleContent>
</Collapsible>


<Combobox options={[{ label: "A", value: "a" }]} />


<Command />



<ContextMenu>
  <ContextMenuTrigger>Right click</ContextMenuTrigger>
  <ContextMenuContent>Menu</ContextMenuContent>
</ContextMenu>


<DataTable columns={[]} data={[]} />


<DatePicker />


<Dialog>
  <DialogTrigger>Open</DialogTrigger>
  <DialogContent>Dialog content</DialogContent>
</Dialog>


<Drawer>
  <DrawerTrigger>Open Drawer</DrawerTrigger>
  <DrawerContent>Drawer content</DrawerContent>
</Drawer>



<DropdownMenu>
  <DropdownMenuTrigger>Open</DropdownMenuTrigger>
  <DropdownMenuContent>Menu</DropdownMenuContent>
</DropdownMenu>


<Empty>Nothing here</Empty>


<Form />


<Input />



<Popover>
  <PopoverTrigger>Open</PopoverTrigger>
  <PopoverContent>Popover content</PopoverContent>
</Popover>


<Progress value={40} />


<Select>
  <SelectItem value="1">One</SelectItem>
</Select>


<Toaster />

<Switch />`;
