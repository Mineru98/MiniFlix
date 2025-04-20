export interface NameChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (currentPassword: string, newName: string) => Promise<void>;
  isLoading: boolean;
  error: string;
  success: string;
}
