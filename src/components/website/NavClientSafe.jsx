"use client";

import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import { usePathname } from "next/navigation";

export default function NavClientSafe() {
  const [isHome, setIsHome] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const checkPage = () => {
      const path = pathname;

      const home = path === "/" || path === "/home" || path === "/school";

      setIsHome(home);
      setScrolled(window.scrollY > 40);
    };

    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    checkPage();

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [pathname]);

  /*
    HOME / SCHOOL:
    top par layout navbar hide
    scroll ke baad show

    OTHER PAGES:
    hamesha show
  */
  if (isHome && !scrolled) {
    return null;
  }

  return <Navbar isHome={isHome} scrolled={scrolled} />;
}
