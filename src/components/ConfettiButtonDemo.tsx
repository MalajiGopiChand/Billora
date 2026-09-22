import { ConfettiButton } from "@/registry/magicui/confetti";
import { useNavigate } from "react-router-dom";

interface ConfettiButtonDemoProps {
  onOpenDashboard?: () => void;
  children?: React.ReactNode;
}

export function ConfettiButtonDemo({ onOpenDashboard, children = "Confetti 🎉" }: ConfettiButtonDemoProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onOpenDashboard) {
      onOpenDashboard();
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="relative">
      <ConfettiButton onClick={handleClick}>{children}</ConfettiButton>
    </div>
  );
}
