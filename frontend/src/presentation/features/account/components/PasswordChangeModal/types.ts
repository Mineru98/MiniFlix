export interface PasswordChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    currentPassword: string,
    newPassword: string,
    confirmPassword: string
  ) => Promise<void>;
  isLoading: boolean;
  error: string;
  success: string;
}
