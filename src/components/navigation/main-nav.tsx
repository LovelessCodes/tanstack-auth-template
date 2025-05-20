import { Link } from "@tanstack/react-router";
import {
	ChevronDown,
	Home,
	LogIn,
	LogOut,
	Menu,
	Moon,
	Settings,
	Sun,
	X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { signinStore } from "~/hooks/signin.store";
import { themeStore } from "~/hooks/theme.store";
import { Route as RootRoute } from "~/routes/__root";
import { getInitials } from "~/utils";
import { AuroraText } from "../magicui/aurora-text";

export function MainNav() {
	const { user } = RootRoute.useRouteContext();
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const { setOpen } = signinStore();
	const { theme, toggleTheme } = themeStore();

	useEffect(() => {
		if (theme) {
			document.documentElement.classList.remove("light", "dark");
			document.documentElement.classList.add(theme);
		}
	}, [theme]);

	const toggleMobileMenu = () => {
		setMobileMenuOpen(!mobileMenuOpen);
	};

	const navItems = [
		{
			to: "/",
			label: "Home",
			icon: <Home className="h-4 w-4" />,
			enabled: true,
		},
	];

	return (
		<nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
			<div className="container mx-auto px-4">
				<div className="grid h-16 items-center grid-cols-2 md:grid-cols-3">
					{/* Logo and brand */}
					<div className="flex items-center">
						<Link
							to="/"
							className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-lavender to-rosewater"
						>
							<AuroraText
								speed={1.5}
								colors={[
									"var(--color-blue-500)",
									"var(--color-mauve)",
									"var(--color-purple-500)",
								]}
							>
								Template
							</AuroraText>
						</Link>
					</div>

					{/* Desktop navigation */}
					<div className="hidden md:flex md:items-center md:justify-center md:space-x-6">
						{navItems
							.filter((item) => item.enabled)
							.map((item) => (
								<Link
									key={item.to}
									to={item.to}
									activeProps={{
										className: "text-primary font-medium",
									}}
									activeOptions={item.to === "/" ? { exact: true } : undefined}
									className="flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-primary"
								>
									{item.icon}
									{item.label}
								</Link>
							))}
					</div>

					{/* User actions */}
					<div className="flex items-center gap-4 justify-end">
						<Button
							variant="outline"
							size="icon"
							onClick={toggleTheme}
							aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
						>
							{theme === "light" ? (
								<Moon className="h-[1.2rem] w-[1.2rem] transition-all" />
							) : (
								<Sun className="h-[1.2rem] w-[1.2rem] transition-all" />
							)}
						</Button>

						{user ? (
							<div className="hidden md:block">
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button
											variant="outline"
											className="flex items-center gap-2 pl-3 pr-2"
										>
											<Avatar className="h-6 w-6">
												<AvatarImage src={user.image || undefined} />
												<AvatarFallback className="bg-primary text-primary-foreground text-xs">
													{getInitials(user.name || user.email || "User")}
												</AvatarFallback>
											</Avatar>
											<span className="text-sm font-normal">
												{user.username ||
													(user.email ? user.email.split("@")[0] : "User")}
											</span>
											<ChevronDown className="h-4 w-4 text-muted-foreground" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end" className="w-56">
										<DropdownMenuLabel className="font-normal">
											<div className="flex flex-col space-y-1">
												<p className="text-sm font-medium leading-none">
													{user.username ||
														(user.email ? user.email.split("@")[0] : "User")}
												</p>
												<p className="text-xs leading-none text-muted-foreground">
													{user.email || ""}
												</p>
											</div>
										</DropdownMenuLabel>
										<DropdownMenuSeparator />
										<DropdownMenuItem asChild>
											<Link
												to="/settings"
												className="flex items-center gap-2 cursor-pointer"
											>
												<Settings className="h-4 w-4" />
												<span>Settings</span>
											</Link>
										</DropdownMenuItem>
										<DropdownMenuSeparator />
										<DropdownMenuItem asChild>
											<Link
												to="/logout"
												className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
											>
												<LogOut className="h-4 w-4" />
												<span>Sign out</span>
											</Link>
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
						) : (
							<Button
								variant="outline"
								className="flex items-center gap-2"
								onClick={() => setOpen(true)}
							>
								<LogIn className="h-4 w-4" />
								<span>Sign in</span>
							</Button>
						)}

						{/* Mobile menu button */}
						<Button
							variant="ghost"
							size="icon"
							className="md:hidden"
							onClick={toggleMobileMenu}
							aria-label="Toggle menu"
						>
							{mobileMenuOpen ? (
								<X className="h-6 w-6" />
							) : (
								<Menu className="h-6 w-6" />
							)}
						</Button>
					</div>
				</div>
			</div>

			{/* Mobile navigation menu */}
			<AnimatePresence>
				{mobileMenuOpen && (
					<motion.div
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: "auto" }}
						exit={{ opacity: 0, height: 0 }}
						transition={{ duration: 0.2 }}
						className="md:hidden border-t"
					>
						<div className="container mx-auto px-4 py-4 space-y-4">
							{/* Mobile nav links */}
							<div className="flex flex-col space-y-3">
								{navItems.map((item) => (
									<Link
										key={item.to}
										to={item.to}
										activeProps={{
											className: "text-primary font-medium",
										}}
										activeOptions={
											item.to === "/" ? { exact: true } : undefined
										}
										className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary p-2 rounded-md hover:bg-muted"
										onClick={() => setMobileMenuOpen(false)}
									>
										{item.icon}
										{item.label}
									</Link>
								))}
							</div>

							{/* Mobile user actions */}
							{user ? (
								<div className="pt-2 border-t flex flex-col gap-3">
									<div className="text-sm text-muted-foreground">
										Signed in as: {user.username || user.email}
									</div>
									<Button
										asChild
										variant="outline"
										size="sm"
										className="gap-1.5"
									>
										<Link
											to="/settings"
											onClick={() => setMobileMenuOpen(false)}
										>
											<Settings className="h-4 w-4" />
											Settings
										</Link>
									</Button>
									<Button
										asChild
										variant="outline"
										size="sm"
										className="gap-1.5"
									>
										<Link to="/logout" onClick={() => setMobileMenuOpen(false)}>
											<LogOut className="h-4 w-4" />
											Sign out
										</Link>
									</Button>
								</div>
							) : (
								<div className="pt-2 border-t">
									<Button onClick={() => setOpen(true)}>Sign in</Button>
								</div>
							)}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</nav>
	);
}
