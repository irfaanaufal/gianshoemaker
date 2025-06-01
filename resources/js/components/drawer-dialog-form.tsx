import { useMediaQuery } from "@/lib/use-media-query";
import React, { ReactNode, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "./ui/button";

interface DrawerDialogFormProps {
    buttonLabel: string | ReactNode;
    buttonClassName?: string;
    dialogTitle: string;
    dialogDescription: string;
    form: ReactNode
}

const DrawerDialogForm = ({
    buttonLabel,
    buttonClassName,
    dialogTitle,
    dialogDescription,
    form
}: DrawerDialogFormProps) => {
    const isDesktop = useMediaQuery("(min-width: 768px)");
    const [open, setOpen] = useState<boolean>(false);
    return isDesktop ?
    <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
            <Button variant="outline" className={buttonClassName}>{buttonLabel}</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription>
                {dialogDescription}
            </DialogDescription>
            </DialogHeader>
            {form}
        </DialogContent>
    </Dialog>
    :
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline">{buttonLabel}</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>{dialogTitle}</DrawerTitle>
          <DrawerDescription>
            {dialogDescription}
          </DrawerDescription>
        </DrawerHeader>
        {form}
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
}

export default DrawerDialogForm;
