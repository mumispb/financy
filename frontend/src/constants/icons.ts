// Import icons as React components
import BriefcaseIcon from "@/assets/icons/briefcase.svg?react"
import CarIcon from "@/assets/icons/car.svg?react"
import HeartbeatIcon from "@/assets/icons/heartbeat.svg?react"
import PiggyBankIcon from "@/assets/icons/piggy-bank.svg?react"
import ReceiptIcon from "@/assets/icons/receipt.svg?react"
import ShoppingCartIcon from "@/assets/icons/shopping-cart.svg?react"
import TicketIcon from "@/assets/icons/ticket.svg?react"
import UtensilsIcon from "@/assets/icons/utensils.svg?react"
import WalletIcon from "@/assets/icons/wallet.svg?react"
import HomeIcon from "@/assets/icons/home.svg?react"
import GiftIcon from "@/assets/icons/gift.svg?react"
import DumbbellIcon from "@/assets/icons/dumbbell.svg?react"
import BookIcon from "@/assets/icons/book.svg?react"
import TravelCartIcon from "@/assets/icons/travel-cart.svg?react"
import LetterIcon from "@/assets/icons/letter.svg?react"
import GroceryIcon from "@/assets/icons/grocery.svg?react"

export const CATEGORY_ICON_MAP: Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>> = {
  briefcase: BriefcaseIcon,
  car: CarIcon,
  heartbeat: HeartbeatIcon,
  "piggy-bank": PiggyBankIcon,
  receipt: ReceiptIcon,
  "shopping-cart": ShoppingCartIcon,
  ticket: TicketIcon,
  utensils: UtensilsIcon,
  wallet: WalletIcon,
  home: HomeIcon,
  gift: GiftIcon,
  dumbbell: DumbbellIcon,
  book: BookIcon,
  "travel-cart": TravelCartIcon,
  letter: LetterIcon,
  grocery: GroceryIcon,
}

export const AVAILABLE_CATEGORY_ICONS = Object.keys(CATEGORY_ICON_MAP)
