// components/ui/BottomNavBar.jsx
import NavItem from "./NavItem";

const navItems = [
  { icon: "code_blocks", label: "Programs", href: "#", isActive: true },
  { icon: "play_circle", label: "Run", href: "#", isActive: false },
  { icon: "bug_report", label: "Debug", href: "#", isActive: false },
  { icon: "history", label: "Past", href: "#", isActive: false },
];

export default function BottomNavBar() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full bg-[#f8f9fb] flex justify-around items-center px-4 py-3 z-50">
      {navItems.map((item) => (
        <NavItem key={item.label} {...item} variant="bottom" />
      ))}
    </nav>
  );
}
