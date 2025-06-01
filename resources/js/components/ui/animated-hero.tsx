import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MoveRight, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@inertiajs/react";

function Hero() {
  const [titleNumber, setTitleNumber] = useState(0);
  const titles = useMemo(
    () => ["amazing", "new", "wonderful", "beautiful", "smart"],
    []
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (titleNumber === titles.length - 1) {
        setTitleNumber(0);
      } else {
        setTitleNumber(titleNumber + 1);
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  return (
    <div className="w-full">
      <div className="container mx-auto">
        <div className="flex gap-8 py-20 lg:py-40 items-center justify-center flex-col">
          <div className="flex gap-4 flex-col">
            <h1 className="text-5xl md:text-7xl max-w-2xl tracking-tighter text-center font-regular">
              <span className="text-spektr-cyan-50">Solusi Terpercaya Perawatan Sepatu Kesanganan Kamu.</span>
            </h1>
            <p className="text-lg md:text-xl leading-relaxed tracking-tight text-muted-foreground max-w-2xl text-center">
              Dengan teknik khusus dan bahan berkualitas, kami menghadirkan layanan terbaik untuk menjaga kebersihan dan keawetan barang kesayanganmu.
            </p>
          </div>
          <div className="flex flex-row gap-3">
            <Link href={route('order.placement')}>
                <Button size="lg" className="gap-4">
                Gunakan Layanan Sekarang <MoveRight className="w-4 h-4" />
                </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export { Hero };
