import React, { useState } from "react";
import { Input, Button } from "@material-tailwind/react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function SearchBar() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative flex w-full gap-2 md:w-max">
      <Input
        type="search"
        label={t("blog.searchPlaceholder")}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="pr-20"
        containerProps={{
          className: "min-w-[200px]",
        }}
      />
      <Button
        size="sm"
        type="submit"
        className="!absolute right-1 top-1 rounded"
      >
        <MagnifyingGlassIcon className="h-4 w-4" />
      </Button>
    </form>
  );
}
