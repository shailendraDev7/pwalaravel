// components/AppHeader.tsx
"use client";

import { useEffect, useState, Fragment, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useCartStore } from "@/lib/store";
import Link from "next/link";
import Image from "next/image";
import logo from "@/assets/images/android-launchericon-48-48.png";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FaBars, FaTimes, FaDownload, FaCog, FaChevronDown } from "react-icons/fa";
import { Dialog, Transition } from "@headlessui/react";
import { ExtendedUser } from "@/types";

// Define BeforeInstallPromptEvent interface
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
  prompt(): Promise<void>;
}

// Type for the translations object
type Translations = {
  [key: string]: string | Translations;
};

// Type for Category data
interface Category {
  id: string;
  cat_name: string;
  description: string | null;
}

export default function AppHeader() {
  const [user, setUser] = useState<ExtendedUser>(null);
  const [role, setRole] = useState("customer");
  const [search, setSearch] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isInstallPrompt, setIsInstallPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [language, setLanguage] = useState("en"); // Default English
  const [theme, setTheme] = useState("light"); // Default light
  const [currentTranslations, setCurrentTranslations] = useState<Translations>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const router = useRouter();
  const { fetchCart } = useCartStore();

  // Load translations dynamically
  const loadTranslations = useCallback(async (lang: string) => {
    try {
      const translationsModule = await import(`@/lib/locales/${lang}.json`);
      setCurrentTranslations(translationsModule.default);
    } catch (error) {
      console.error(`Failed to load translations for ${lang}:`, error);
      const defaultTranslationsModule = await import(`@/lib/locales/en.json`);
      setCurrentTranslations(defaultTranslationsModule.default);
    }
  }, []);

  // Get translated text
  const getTranslation = useCallback(
    (key: keyof Translations | string) => currentTranslations[key] || key,
    [currentTranslations]
  );

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    const { data, error } = await supabase.from("categories").select("id, cat_name").order("cat_name", { ascending: true });
    if (error) console.error("Error fetching categories:", error);
    else setCategories(data || []);
  }, []);

  // Handle authentication and initialization
  useEffect(() => {
    setIsClient(true);
    const storedLanguage = localStorage.getItem("appLanguage") || "en";
    setLanguage(storedLanguage);
    loadTranslations(storedLanguage);

    const handleAuthState = async (session: { user: ExtendedUser | null }) => {
      setUser(session?.user || null);
      if (session?.user) {
        await fetchCart();
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single();
        const { data: vendor } = await supabase.from("vendors").select("id").eq("user_id", session.user.id).single();
        setRole(vendor ? "vendor" : profile?.role || "customer");
      } else {
        setRole("customer");
        setUser(null);
      }
    };

    const { data: authListener } = supabase.auth.onAuthStateChange(handleAuthState);
    supabase.auth.getUser().then(({ data }) => handleAuthState(data));

    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    if (!isStandalone) {
      const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !("MSStream" in window);
      setIsIOS(isIOSDevice);
      if (!isIOSDevice) {
        const handler = (e: Event) => {
          e.preventDefault();
          const installEvent = e as BeforeInstallPromptEvent;
          setDeferredPrompt(installEvent);
          setIsInstallPrompt(true);
        };
        window.addEventListener("beforeinstallprompt", handler);
        return () => window.removeEventListener("beforeinstallprompt", handler);
      } else {
        setIsInstallPrompt(true);
      }
    }

    fetchCategories();

    return () => authListener.subscription.unsubscribe();
  }, [fetchCart, loadTranslations, fetchCategories]);

  useEffect(() => {
    if (!isClient) return;
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme, isClient]);

  // Handle login with email and password
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword });
    if (error) alert(`${getTranslation("login_failed") || "लगइन असफल"}: ${error.message}`);
    else {
      setIsLoginOpen(false);
      setLoginEmail("");
      setLoginPassword("");
    }
  };

  // Handle Google login
  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: "google" });
    if (error) alert(`${getTranslation("google_login_failed") || "Google login failed"}: ${error.message}`);
  };

  // Handle logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  // Handle PWA installation
  const handleInstall = async () => {
    if (!isClient) return;
    if (isIOS) {
      alert(getTranslation("install_ios_guide") || "Please add to home screen via the share button.");
      return;
    }
    if (deferredPrompt) {
      setIsInstallPrompt(false);
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        // App will switch to standalone mode
      } else {
        setIsInstallPrompt(true);
      }
      setDeferredPrompt(null);
    }
  };

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/search?q=${encodeURIComponent(search)}`);
      setIsMenuOpen(false);
    }
  };

  // Handle language change
  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    localStorage.setItem("appLanguage", lang);
    loadTranslations(lang);
  };

  // Handle theme change
  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
  };

  const menuItems = (
    <>
      <div className="relative group hidden md:block">
        <Button
          onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
          className="text-gray-600 hover:text-blue-500 dark:text-gray-300 dark:hover:text-blue-400 flex items-center"
          variant="ghost"
        >
          {getTranslation("categories") || "Categories"}{" "}
          <FaChevronDown
            className={`ml-1 transition-transform duration-200 ${isCategoryDropdownOpen ? "rotate-180" : "rotate-0"}`}
          />
        </Button>
        {isCategoryDropdownOpen && (
          <div
            onMouseLeave={() => setIsCategoryDropdownOpen(false)}
            className="absolute left-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg py-1 z-10"
          >
            <Link
              href="/categories"
              className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
              onClick={() => setIsCategoryDropdownOpen(false)}
            >
              {getTranslation("all_categories") || "All Categories"}
            </Link>
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.id}`}
                className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600"
                onClick={() => setIsCategoryDropdownOpen(false)}
              >
                {category.cat_name}
              </Link>
            ))}
          </div>
        )}
      </div>

      <Link
        href="/categories"
        className="md:hidden text-gray-600 hover:text-blue-500 dark:text-gray-300 dark:hover:text-blue-400"
        onClick={() => setIsMenuOpen(false)}
      >
        {getTranslation("categories") || "Categories"}
      </Link>

      <Link
        href="/cart"
        className="text-gray-600 hover:text-blue-500 dark:text-gray-300 dark:hover:text-blue-400"
        onClick={() => setIsMenuOpen(false)}
      >
        {getTranslation("cart") || "Cart"}
      </Link>

      {user ? (
        <>
          <Link
            href="/account"
            className="text-gray-600 hover:text-blue-500 dark:text-gray-300 dark:hover:text-blue-400"
            onClick={() => setIsMenuOpen(false)}
          >
            {getTranslation("account") || "Account"} ({role})
          </Link>
          <Button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2">
            {getTranslation("logout") || "Logout"}
          </Button>
        </>
      ) : (
        <Button
          onClick={() => {
            setIsLoginOpen(true);
            setIsMenuOpen(false);
          }}
          variant="outline"
        >
          {getTranslation("account") || "Account"}
        </Button>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-20 bg-white dark:bg-gray-800 shadow-md p-4">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="hidden md:block">
          <Image src={logo} alt="Amigo eStore Logo" className="object-cover rounded" width={48} height={48} />
        </Link>

        <div className="hidden md:flex flex-grow max-w-xl mx-4 relative">
          <form onSubmit={handleSearch} className="w-full">
            <Input
              type="text"
              placeholder={getTranslation("search_placeholder") || "Search"}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-full border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              aria-label="Search products"
            />
          </form>
          {isInstallPrompt && (
            <Button
              onClick={handleInstall}
              variant="outline"
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
              aria-label={getTranslation("install_app") || "Install App"}
            >
              <FaDownload className="text-gray-600 dark:text-gray-300" />
            </Button>
          )}
        </div>

        <nav className="hidden md:flex items-center gap-4">
          {menuItems}
          <Button onClick={() => setIsSettingsOpen(true)} variant="ghost" aria-label="Settings">
            <FaCog className="text-gray-600 dark:text-gray-300" />
          </Button>
        </nav>

        <div className="md:hidden flex items-center justify-between w-full">
          <Button onClick={() => setIsMenuOpen(true)} className="mr-2 bg-blue-600 text-white hover:bg-blue-700">
            <FaBars className="text-white" />
          </Button>

          <form onSubmit={handleSearch} className="flex-grow">
            <Input
              type="text"
              placeholder={getTranslation("search_placeholder_mobile") || "Search"}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-full border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </form>

          <div className="flex items-center gap-2 ml-2">
            {isInstallPrompt && (
              <Button onClick={handleInstall} className="bg-blue-600 text-white hover:bg-blue-700" aria-label="Install App">
                <FaDownload className="text-white" />
              </Button>
            )}
            <Button onClick={() => setIsSettingsOpen(true)} className="bg-blue-600 text-white hover:bg-blue-700" aria-label="Settings">
              <FaCog className="text-white" />
            </Button>
          </div>
        </div>
      </div>

      <Transition appear show={isMenuOpen} as={Fragment}>
        <Dialog as="div" className="relative z-30" onClose={() => setIsMenuOpen(false)}>
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
            <div className="flex min-h-full items-start justify-start">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="ease-in duration-200"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <Dialog.Panel className="w-64 max-w-xs bg-white dark:bg-gray-800 h-full p-4 shadow-xl">
                  <div className="flex justify-end mb-4">
                    <Button onClick={() => setIsMenuOpen(false)}>
                      <FaTimes className="text-gray-600 dark:text-gray-300" />
                    </Button>
                  </div>
                  <nav className="flex flex-col gap-4">
                    <div className="relative">
                      <Button
                        onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                        className="text-gray-600 hover:text-blue-500 dark:text-gray-300 dark:hover:text-blue-400 w-full justify-start"
                        variant="ghost"
                      >
                        {getTranslation("categories") || "Categories"}{" "}
                        <FaChevronDown
                          className={`ml-auto transition-transform duration-200 ${isCategoryDropdownOpen ? "rotate-180" : "rotate-0"}`}
                        />
                      </Button>
                      {isCategoryDropdownOpen && (
                        <div className="pl-4 py-2 space-y-2">
                          {categories.map((category) => (
                            <Link
                              key={category.id}
                              href={`/categories/${category.id}`}
                              className="block text-sm text-gray-700 dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-400"
                              onClick={() => {
                                setIsCategoryDropdownOpen(false);
                                setIsMenuOpen(false);
                              }}
                            >
                              {category.cat_name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                    <Link href="/cart" className="text-gray-600 hover:text-blue-500 dark:text-gray-300 dark:hover:text-blue-400" onClick={() => setIsMenuOpen(false)}>
                      {getTranslation("cart") || "Cart"}
                    </Link>
                    {user ? (
                      <>
                        <Link href="/account" className="text-gray-600 hover:text-blue-500 dark:text-gray-300 dark:hover:text-blue-400" onClick={() => setIsMenuOpen(false)}>
                          {getTranslation("account") || "Account"} ({role})
                        </Link>
                        <Button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 w-full justify-start">
                          {getTranslation("logout") || "Logout"}
                        </Button>
                      </>
                    ) : (
                      <Button onClick={() => { setIsLoginOpen(true); setIsMenuOpen(false); }} variant="outline" className="w-full justify-start">
                        {getTranslation("account") || "Account"}
                      </Button>
                    )}
                  </nav>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      <Transition appear show={isLoginOpen} as={Fragment}>
        <Dialog as="div" className="relative z-30" onClose={() => setIsLoginOpen(false)}>
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
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">
                    {getTranslation("login_signup_title") || "लगइन"}
                  </Dialog.Title>
                  <div className="mt-4">
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div>
                        <label htmlFor="loginEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          {getTranslation("email_address") || "इमेल"}
                        </label>
                        <Input
                          id="loginEmail"
                          type="email"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          placeholder={getTranslation("email_placeholder") || "इमेल"}
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label htmlFor="loginPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          {getTranslation("password") || "पासवर्ड"}
                        </label>
                        <Input
                          id="loginPassword"
                          type="password"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder={getTranslation("password_placeholder") || "पासवर्ड"}
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <Button type="submit" className="w-full bg-blue-600 text-white hover:bg-blue-700">
                        {getTranslation("login") || "लगइन गर्नुहोस्"}
                      </Button>
                      <Button type="button" onClick={handleGoogleLogin} className="w-full bg-red-600 text-white hover:bg-red-700 mt-2">
                        {getTranslation("login_with_google") || "Google Login"}
                      </Button>
                    </form>
                    <div className="mt-4 text-center text-sm">
                      <Link href="/auth/signup" className="text-blue-600 hover:underline dark:text-blue-400" onClick={() => setIsLoginOpen(false)}>
                        {getTranslation("create_account") || "साइनअप"}
                      </Link>
                    </div>
                    <div className="mt-2 text-center text-sm">
                      <Link href="/auth/forgot-password" className="text-blue-600 hover:underline dark:text-blue-400" onClick={() => setIsLoginOpen(false)}>
                        {getTranslation("forgot_password") || "पासवर्ड बिर्सनुभयो?"}
                      </Link>
                    </div>
                    <div className="mt-4">
                      <Button
                        type="button"
                        className="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                        onClick={() => setIsLoginOpen(false)}
                      >
                        {getTranslation("got_it") || "बुझियो"}
                      </Button>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      <Transition appear show={isSettingsOpen} as={Fragment}>
        <Dialog as="div" className="relative z-30" onClose={() => setIsSettingsOpen(false)}>
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
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">
                    {getTranslation("settings_title") || "सेटिङ"}
                  </Dialog.Title>
                  <div className="mt-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {getTranslation("language") || "भाषा"}
                      </label>
                      <select
                        value={language}
                        onChange={(e) => handleLanguageChange(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      >
                        <option value="en">{getTranslation("english") || "English"}</option>
                        <option value="ne">{getTranslation("nepali") || "नेपाली"}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {getTranslation("theme") || "थिम"}
                      </label>
                      <select
                        value={theme}
                        onChange={(e) => handleThemeChange(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      >
                        <option value="light">{getTranslation("light") || "Light"}</option>
                        <option value="dark">{getTranslation("dark") || "Dark"}</option>
                      </select>
                    </div>
                    <Button onClick={() => setIsSettingsOpen(false)} className="w-full">
                      {getTranslation("close") || "बन्द गर्नुहोस्"}
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