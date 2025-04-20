import React from 'react';
import { Search, X } from 'lucide-react';
import { 
  SearchBarContainer, 
  SearchInputWrapper, 
  SearchInput, 
  SearchIconButton, 
  ClearButton 
} from './styles';
import { SEARCH_CONSTANTS } from './constants';
import { SearchBarProps } from './types';
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