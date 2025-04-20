import styled from "styled-components";

export const MessageContainer = styled.div`
  color: green;
  margin-bottom: 15px;
  padding: 8px 12px;
  background-color: rgba(0, 128, 0, 0.1);
  border-radius: 4px;
  border-left: 4px solid green;
  animation: fadeIn 0.3s ease-in-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-5px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
