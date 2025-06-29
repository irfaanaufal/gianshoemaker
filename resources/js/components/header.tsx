import { Button } from "@/components/ui/button";
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Link, usePage } from "@inertiajs/react";
import { Menu, MoveRight, X } from "lucide-react";
import { useState } from "react";
import { SharedData } from "../types";

export default function Header() {
    const { auth } = usePage<SharedData>().props;
    const navigationItems = [
        {
            title: "Home",
            href: "/",
            description: "",
        },
        {
            title: "Layanan",
            description: "",
            href: "/#layanan-kami",
        },
        {
            title: "Tentang",
            description: "",
            href: "/#about-us"
        },
        {
            title: "Galery",
            description: "",
            href: "#"
        },
    ];

    const [isOpen, setOpen] = useState(false);
    return (
        <header className="w-full z-40 fixed top-0 left-0 bg-background">
            <div className="container relative mx-auto min-h-20 flex gap-4 flex-row lg:grid lg:grid-cols-3 items-center">
                <div className="flex lg:justify-center items-center">
                    <img src={`/assets/logo-gianshoemaker.png`} alt="LOGO GIANSHOEMAKER" className="w-[4rem] bg-black rounded-full dark:bg-transparent dark:w-[6rem]" />
                </div>
                <div className="justify-center items-center gap-4 lg:flex hidden flex-row">
                    <NavigationMenu className="flex justify-start items-start">
                        <NavigationMenuList className="flex justify-start gap-4 flex-row">
                            {navigationItems.map((item) => (
                                <NavigationMenuItem key={item.title}>
                                    <NavigationMenuLink href={item.href}>
                                        <Button variant="ghost" className="dark:text-white">{item.title}</Button>
                                    </NavigationMenuLink>
                                </NavigationMenuItem>
                            ))}
                        </NavigationMenuList>
                    </NavigationMenu>
                </div>
                <div className="flex justify-end w-full gap-4">
                    <div className="border-r hidden md:inline"></div>
                    {auth.user ?
                        <Link href={route('dashboard')}>
                            <Button>Dashboard</Button>
                        </Link>
                        :
                        <Link href={route('login')}>
                            <Button>Login</Button>
                        </Link>
                    }
                </div>
                <div className="flex w-12 shrink lg:hidden items-end justify-end">
                    <Button onClick={() => setOpen(!isOpen)}>
                        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </Button>
                    {isOpen && (
                        <div className="absolute top-20 border-t flex flex-col w-full right-0 bg-background shadow-lg py-4 container gap-8 px-3 dark:text-white">
                            {navigationItems.map((item) => (
                                <div key={item.title}>
                                    <div className="flex flex-col gap-2">
                                        <Link
                                            href={item.href}
                                            className="flex justify-between items-center"
                                        >
                                            <span className="text-lg">{item.title}</span>
                                            <MoveRight className="w-4 h-4 stroke-1 text-muted-foreground" />
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </header >
    );
}
