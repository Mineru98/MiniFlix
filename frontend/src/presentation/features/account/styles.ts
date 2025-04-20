import styled from "styled-components";

export const Container = styled.div`
  background-color: #fafafa;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

export const PageBackground = styled.div`
  width: 100%;
  background-color: #fff;
  border-bottom: 1px solid rgba(128, 128, 128, 0.2);
  height: 56px; /* 헤더 높이 유지 */
`;

export const Navigation = styled.nav`
  display: flex;
  padding: 0 16px;
  background-color: #fafafa;
  border-bottom: 1px solid rgba(128, 128, 128, 0.2);
  overflow-x: auto;
  white-space: nowrap;
`;

export const NavItem = styled.a`
  padding: 10px 10px 12.5px;
  color: rgba(0, 0, 0, 0.7);
  font-size: 14px;
  font-weight: 400;
  cursor: pointer;
`;

export const NavItemActive = styled(NavItem)`
  color: #000;
  font-weight: 500;
  border-bottom: 4px solid #e50914;
`;

export const MainContent = styled.main`
  padding: 24px 16px 56px;
  display: flex;
  flex-direction: column;
`;

export const Section = styled.section`
  width: 100%;
`;

export const SectionTitle = styled.h1`
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 1px;
  color: #000;
  line-height: 1.2;
`;

export const SectionContainer = styled.div`
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  width: 100%;
`;

export const SectionHeading = styled.h2`
  font-size: 16px;
  font-weight: 400;
  margin-bottom: 12px;
  color: #333;
`;

export const CardContainer = styled.div`
  background: #fff;
  border: 1px solid rgba(128, 128, 128, 0.4);
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

export const CardList = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 4px;
`;

export const CardItem = styled.div`
  padding: 8px 0;
  border-radius: 4px;
  width: 100%;
`;

export const CardButton = styled.button`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0 12px 0 10px;
  text-align: left;
  background: none;
  border: none;
  cursor: pointer;
`;

export const CardLeft = styled.div`
  display: flex;
  align-items: center;
`;

export const IconContainer = styled.div`
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 12px;
`;

export const ProfileImageContainer = styled.div`
  width: 42px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 10px;
`;

export const CardContent = styled.div`
  display: flex;
  flex-direction: column;
`;

export const CardTitle = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: #000;
`;

export const CardSubtitle = styled.div`
  font-size: 12px;
  color: rgba(0, 0, 0, 0.7);
  margin-top: 4px;
`;

export const ArrowContainer = styled.div`
  display: flex;
  align-items: center;
`;

export const ProfileRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
`;

export const Badge = styled.div`
  background-color: #bcd8ff;
  padding: 4px 5px;
  border-radius: 2px;
  font-size: 10px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.7);
`;

export const Divider = styled.div`
  height: 1.5px;
  background-color: rgba(128, 128, 128, 0.2);
  margin-left: 16px;
  width: calc(100% - 16px);
`;

export const AddProfileContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 0 4px 17px;
  width: 100%;
`;

export const AddProfileButton = styled.button`
  background-color: rgba(128, 128, 128, 0.3);
  color: #000;
  font-size: 16px;
  font-weight: 500;
  padding: 12px 16px;
  border-radius: 4px;
  width: 100%;
  border: none;
  cursor: pointer;
  text-align: center;
`;

export const AddProfileNote = styled.p`
  font-size: 13px;
  color: rgba(0, 0, 0, 0.7);
  text-align: center;
  line-height: 1.2;
`;

export const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

export const ModalContent = styled.div`
  background-color: white;
  width: 90%;
  max-width: 450px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(128, 128, 128, 0.2);
`;

export const ModalTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #000;
  margin: 0;
`;

export const ModalCloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const ModalBody = styled.div`
  padding: 20px;
`;

export const FormGroup = styled.div`
  margin-bottom: 20px;
`;

export const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
`;

export const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid rgba(128, 128, 128, 0.4);
  border-radius: 4px;
  font-size: 14px;
  color: #000;

  &:focus {
    outline: none;
    border-color: #e50914;
  }

  &::placeholder {
    color: rgba(0, 0, 0, 0.5);
  }
`;

export const ErrorMessage = styled.div`
  color: #e50914;
  font-size: 14px;
  margin-bottom: 15px;
`;

export const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid rgba(128, 128, 128, 0.2);
`;

export const SubmitButton = styled.button`
  background-color: #e50914;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;

  &:disabled {
    background-color: rgba(229, 9, 20, 0.5);
    cursor: not-allowed;
  }
`;

export const CancelButton = styled.button`
  background-color: rgba(128, 128, 128, 0.2);
  color: #333;
  border: none;
  border-radius: 4px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
`;
