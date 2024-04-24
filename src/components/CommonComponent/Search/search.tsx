import React, { ChangeEvent, useEffect, useRef } from "react";
import "./search.css";

interface SearchProps {
  value: string;
  handleChange: (event: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

const Search: React.FC<SearchProps> = ({
  value,
  handleChange,
  placeholder,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
  return (
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={handleChange}
      ref={inputRef}
    />
  );
};

export default React.memo(Search);
