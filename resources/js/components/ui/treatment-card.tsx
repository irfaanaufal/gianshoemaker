import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Treatment } from "@/types";
import { Button } from "./button";
import { Link } from "@inertiajs/react";

const TreatmentCard = ({ data, className }: { data: Treatment[]; className?: string }) => {
    // Fungsi untuk memotong deskripsi menjadi 20 kata
    const truncateDescription = (description: string, wordLimit: number = 20) => {
    const words = description.split(" "); // Memecah deskripsi berdasarkan spasi
    if (words.length <= wordLimit) {
        return description; // Jika kataใน deskripsiไม่เกินขีดจำกัด
    }
    return words.slice(0, wordLimit).join(" ") + "..."; // Jikaเกินคำจำกัด, return with "..."
    };

    return (
        <>
        {data && data.length > 0 ? (
            data.map((treatment, idx) => (
            <Card key={idx} className={className}>
                <img src={treatment.picture} alt={treatment.slug} className="rounded-md h-[10rem] object-cover" />
                <CardHeader>
                    <CardTitle>{treatment.name}</CardTitle>
                    <CardDescription>{truncateDescription(treatment.description, 8)}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Link href={route('order.create')}>
                        <Button className="w-full">Pesan Sekarang</Button>
                    </Link>
                </CardContent>
            </Card>
            ))
        ) : (
            <Card>
            <CardHeader>
                <CardTitle>Card Title</CardTitle>
                <CardDescription>Card Description</CardDescription>
            </CardHeader>
            <CardContent>
                <p>Card Content</p>
            </CardContent>
            <CardFooter>
                <p>Card Footer</p>
            </CardFooter>
            </Card>
        )}
        </>
    );
};

export { TreatmentCard };
