import React, { useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { 
  SearchBarContainer, 
  SearchInputWrapper, 
  SearchInput, 
  SearchIconButton, 
  ClearButton 
} from './styles';
import { SEARCH_CONSTANTS } from './constants';

interface SearchBarProps {
  query: string;
  onSearch: () => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onClear: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  query,
  onSearch,
  onInputChange,
  onKeyDown,
  onClear
}) => {
  return (
    <SearchBarContainer>
      <SearchInputWrapper>
        <SearchIconButton onClick={onSearch}>
          <Search size={20} />
        </SearchIconButton>
        <SearchInput
          type="text"
          placeholder={SEARCH_CONSTANTS.SEARCH_PLACEHOLDER}
          value={query}
          onChange={onInputChange}
          onKeyDown={onKeyDown}
        />
        {query && (
          <ClearButton onClick={onClear}>
            <X size={20} />
          </ClearButton>
        )}
      </SearchInputWrapper>
    </SearchBarContainer>
  );
};

export default SearchBar; 