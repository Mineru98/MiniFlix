import React from 'react';
import { Home, Film, PlayCircle, User } from 'lucide-react';
import { 
  NavContainer, 
  NavItem, 
  NavText, 
  IconWrapper,
  NotificationBadge
} from './styles';

interface NavigationBarProps {
  className?: string;
}

const NavigationBar: React.FC<NavigationBarProps> = ({ className }) => {
  return (
    <NavContainer className={className}>
      <NavItem className="active">
        <IconWrapper>
          <Home size={20} strokeWidth={2.5} />
        </IconWrapper>
        <NavText>홈</NavText>
      </NavItem>
      
      <NavItem>
        <IconWrapper>
          <PlayCircle size={20} strokeWidth={2.5} />
          <NotificationBadge>4</NotificationBadge>
        </IconWrapper>
        <NavText>NEW & HOT</NavText>
      </NavItem>
      
      <NavItem>
        <IconWrapper>
          <User size={20} strokeWidth={2.5} />
        </IconWrapper>
        <NavText>나의 넷플릭스</NavText>
      </NavItem>
    </NavContainer>
  );
};

export default NavigationBar; 