import { PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";

function CTA() {
    return (
        <div className="w-full py-20 lg:py-40">
            <div className="container mx-auto">
                <div className="flex flex-col text-center bg-muted rounded-md p-4 lg:p-14 gap-8 items-center">
                    <div className="flex flex-col gap-2">
                        <h3 className="text-3xl md:text-5xl tracking-tighter max-w-xl font-regular dark:text-white">
                            Tidak sempat mengunjungi Store Kami?
                        </h3>
                        <p className="text-lg leading-relaxed tracking-tight text-muted-foreground max-w-xl dark:text-white">
                            Tenang, Gianshoemaker kini memiliki layanan antar
                            jemput! Silahkan hubungi kami sekarang juga.
                        </p>
                    </div>
                    <div className="flex flex-row gap-4">
                        <a href={`https://wa.me/6287831633858`} target="_blank">
                            <Button className="gap-4">
                                Hubungi Kami Sekarang <PhoneCall className="w-4 h-4" />
                            </Button>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}

export { CTA };
