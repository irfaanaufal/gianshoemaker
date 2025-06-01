import { toast } from "sonner";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "./ui/alert-dialog";
import { Button } from "./ui/button";
import { api } from "@/lib/utils";
import { ReactNode } from "react";

const AlertDelete = ({
    buttonLabel,
    buttonClassName,
    url
}: {
    buttonLabel: string | ReactNode;
    buttonClassName?: string;
    url: string;
}) => {
    const handleAction = async () => {
        try {
            const response = await api.post(url, { _method: "DELETE" });
            if (response.status === 205) {
                toast(response.data.message);
            }
            if (response.status === 200) {
                toast(response.data.message);
                setTimeout(() => {
                    window.location.reload();
                }, 3000);
            }
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className={buttonClassName}>
                    {buttonLabel}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Apakah Kamu Yakin ingin menghapus data ini?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Tindakan ini tidak dapat dibatalkan. Tindakan ini akan menghapus akun Anda secara permanen dan menghapus data Anda dari server kami.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction onClick={handleAction}>Hapus</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
export default AlertDelete;
