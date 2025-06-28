"use client";

import { useState, useEffect, Fragment } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/store";
import { FaBars, FaTimes, FaDownload, FaCog } from "react-icons/fa";
import { Dialog, Transition } from "@headlessui/react";
import translations from "@/lib/i18n/ne.json";
import Image from "next/image";
import logo from "@/assets/images/android-launchericon-48-48.png"; // Adjust path as needed

// Define BeforeInstallPromptEvent interface
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function AppHeader() {
  const [search, setSearch] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isInstallPrompt, setIsInstallPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isClient, setIsClient] = useState(false); // Track client-side rendering
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [language, setLanguage] = useState("en"); // Default English
  const [theme, setTheme] = useState("light"); // Default light
  const { items } = useCartStore();
  const router = useRouter();

  useEffect(() => {
    // Mark as client-side
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return; // Skip on server

    // Check if already installed or prompt shown
    const isStandalone = window.matchMedia(
      "(display-mode: standalone)"
    ).matches;
    const isPromptShown =
      typeof window !== "undefined" &&
      localStorage.getItem("installPromptShown");
    if (isStandalone || isPromptShown) {
      setIsInstallPrompt(false);
      return;
    }

    // Detect iOS
    const isIOSDevice =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !("MSStream" in window);
    setIsIOS(isIOSDevice);

    // Handle beforeinstallprompt for non-iOS
    if (!isIOSDevice) {
      const handler = (e: Event) => {
        e.preventDefault();
        const installEvent = e as BeforeInstallPromptEvent;
        setDeferredPrompt(installEvent);
        setIsInstallPrompt(true);
      };

      const timeout = setTimeout(() => {
        window.addEventListener("beforeinstallprompt", handler);
      }, 30000); // 30-second delay

      return () => {
        clearTimeout(timeout);
        window.removeEventListener("beforeinstallprompt", handler);
      };
    }
  }, [isClient]);

  useEffect(() => {
    if (!isClient) return; // Skip on server
    // Apply theme
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme, isClient]);

  const handleInstall = async () => {
    if (!isClient) return; // Skip on server

    if (isIOS) {
      alert(
        translations.install_ios_guide ||
          "To install, tap Share > Add to Home Screen."
      );
      localStorage.setItem("installPromptShown", "true");
      setIsInstallPrompt(false);
      return;
    }

    if (deferredPrompt) {
      setIsInstallPrompt(false);
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        localStorage.setItem("installPromptShown", "true");
      }
      setDeferredPrompt(null);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/search?q=${encodeURIComponent(search)}`);
      setIsMenuOpen(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoginOpen(false);
  };

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    // TODO: Implement i18n logic (e.g., reload with new locale)
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
  };

  const menuItems = (
    <>
      <Link
        href="/categories"
        className="text-gray-600 hover:text-blue-500"
        onClick={() => setIsMenuOpen(false)}
      >
        {translations.categories || "Categories"}
      </Link>
      <Link
        href="/cart"
        className="text-gray-600 hover:text-blue-500"
        onClick={() => setIsMenuOpen(false)}
      >
        {translations.cart || "Cart"} ({items.length})
      </Link>
      <Button
        onClick={() => {
          setIsLoginOpen(true);
          setIsMenuOpen(false);
        }}
        variant="outline"
      >
        {translations.account || "Account"}
      </Button>
    </>
  );

  return (
    <header className="sticky top-0 z-20 bg-white dark:bg-gray-800 shadow-md p-4">
      <div className="container mx-auto flex items-center justify-between">
        <Link
          href="/"
          className="text-2xl font-bold text-blue-600 dark:text-blue-400"
        >
          <Image
            src={logo}
            alt="Amigo eStore Logo"
            className="object-cover"
          />
        </Link>

        <div className="hidden md:flex flex-grow max-w-xl mx-4">
          <form onSubmit={handleSearch} className="w-full">
            <Input
              type="text"
              placeholder={
                translations.search_placeholder ||
                "Search products (e.g., Dhaka Topi)"
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-full border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              aria-label="Search products"
            />
          </form>
        </div>

        <nav className="hidden md:flex items-center gap-4">
          {menuItems}
          <Button
            onClick={() => setIsSettingsOpen(true)}
            variant="ghost"
            aria-label="Settings"
          >
            <FaCog className="text-gray-600 dark:text-gray-300" />
          </Button>
        </nav>

        <div className="md:hidden flex items-center gap-2">
          <Button
            onClick={() => setIsSettingsOpen(true)}
            variant="ghost"
            aria-label="Settings"
          >
            <FaCog className="text-gray-600 dark:text-gray-300" />
          </Button>
          <Button onClick={() => setIsMenuOpen(true)}>
            <FaBars className="text-gray-600 dark:text-gray-300" />
          </Button>
        </div>
      </div>

      <div className="md:hidden w-full mt-4 relative">
        <form onSubmit={handleSearch} className="w-full">
          <Input
            type="text"
            placeholder={
              translations.search_placeholder_mobile || "Search products"
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-full border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white pl-4 pr-10"
          />
          {isInstallPrompt && (
            <Button
              onClick={handleInstall}
              variant="ghost"
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
              aria-label={translations.install_app || "Install App"}
            >
              <FaDownload className="text-gray-600 dark:text-gray-300" />
            </Button>
          )}
        </form>
      </div>

      <Transition appear show={isMenuOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-30"
          onClose={() => setIsMenuOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-start justify-end">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="ease-in duration-200"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="w-64 bg-white dark:bg-gray-800 h-full p-4 shadow-xl">
                  <Button onClick={() => setIsMenuOpen(false)} className="mb-4">
                    <FaTimes className="text-gray-600 dark:text-gray-300" />
                  </Button>
                  <nav className="flex flex-col gap-4">{menuItems}</nav>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      <Transition appear show={isLoginOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-30"
          onClose={() => setIsLoginOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100"
                  >
                    {translations.login_title || "Login or Sign Up"}
                  </Dialog.Title>
                  <form onSubmit={handleLogin} className="mt-4 space-y-4">
                    <Input
                      type="email"
                      placeholder={translations.email_placeholder || "Email"}
                      required
                      className="w-full dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    />
                    <Input
                      type="password"
                      placeholder={
                        translations.password_placeholder || "Password"
                      }
                      required
                      className="w-full dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    />
                    <div className="flex gap-2">
                      <Button type="submit" className="w-full">
                        {translations.login || "Login"}
                      </Button>
                      <Button
                        type="submit"
                        variant="outline"
                        className="w-full"
                      >
                        {translations.sign_up || "Sign Up"}
                      </Button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      <Transition appear show={isSettingsOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-30"
          onClose={() => setIsSettingsOpen(false)}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100"
                  >
                    {translations.settings_title || "Settings"}
                  </Dialog.Title>
                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {translations.language || "Language"}
                      </label>
                      <select
                        value={language}
                        onChange={(e) => handleLanguageChange(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      >
                        <option value="en">
                          {translations.english || "English"}
                        </option>
                        <option value="ne">
                          {translations.nepali || "Nepali"}
                        </option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {translations.theme || "Theme"}
                      </label>
                      <select
                        value={theme}
                        onChange={(e) => handleThemeChange(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      >
                        <option value="light">
                          {translations.light || "Light"}
                        </option>
                        <option value="dark">
                          {translations.dark || "Dark"}
                        </option>
                      </select>
                    </div>
                    <Button
                      onClick={() => setIsSettingsOpen(false)}
                      className="w-full"
                    >
                      {translations.close || "Close"}
                    </Button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </header>
  );
}
