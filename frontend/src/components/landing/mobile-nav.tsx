"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

type NavLink = { href: string; label: string };

export const MobileNav = ({ links }: { links: NavLink[] }) => (
  <div className="mobileNav">
    <DropdownMenu>
      <DropdownMenuTrigger asChild><Button variant="outline" size="icon-lg" className="size-11 bg-white" aria-label="Mở menu"><Menu className="size-5"/></Button></DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="min-w-56 p-2">
        {links.map((link) => <DropdownMenuItem key={link.href} asChild className="px-3 py-3 text-[15px] font-semibold"><a href={link.href}>{link.label}</a></DropdownMenuItem>)}
      </DropdownMenuContent>
    </DropdownMenu>
  </div>
);
