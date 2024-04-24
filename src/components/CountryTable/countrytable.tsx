import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import debounce from "lodash.debounce";
import "./countrytable.css";
import Search from "../CommonComponent/Search";
import { Country, SortField } from "./contrytabletype";

const Loader: React.FC = () => <div>Loading...</div>;

const CountryTable: React.FC = () => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortedField, setSortedField] = useState<SortField | null>({
    name: "name",
    label: "Country Name",
  });
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [countriesPerPage] = useState<number>(10);
  const [loading, setLoading] = useState<boolean>(false);

  /**
   * fetch countries data
   */
  const fetchCountries = async (searchTerm: string | null) => {
    setLoading(true);
    try {
      if (searchTerm?.trim() !== "") {
        const response = await axios.get(
          `${process.env.REACT_APP_API_ENDPOINT}/name/${searchTerm}`
        );
        if (response?.status === 200) {
          const data: any[] = response.data;
          const fetchedCountries: Country[] = data.map((country, index) => ({
            name: country.name.common,
            flag: country.flags.svg,
            no: index + 1,
          }));
          setCountries(fetchedCountries);
          setLoading(false);
        } else {
          setCountries([]);
        }
      } else {
        setCountries([]);
      }
    } catch (error) {
      setCountries([]);
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Initial call
   */
  useEffect(() => {
    if (searchTerm.trim() !== "") {
      fetchCountries(searchTerm);
    } else {
      setCountries([]);
    }
  }, []);

  const debounceRequest = useMemo(() => {
    return debounce(fetchCountries, 500);
  }, [fetchCountries]);

  /**
   * handle search change
   */
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setSearchTerm(value);
    debounceRequest(value);
  };

  /**
   *
   * @param field
   * @returns
   * handle sorting
   */
  const sortCountries = (field: SortField) => {
    if (field?.name === "no") {
      setSortedField({ name: "no", label: "No." });
      setCountries((prevCountries) =>
        [...prevCountries].sort((a, b) =>
          sortOrder === "asc"
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name)
        )
      );
      return;
    }

    if (field.name === "name") {
      setSortedField({ name: "name", label: "Country Name" });
      setCountries((prevCountries) =>
        [...prevCountries].sort((a, b) =>
          sortOrder === "asc"
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name)
        )
      );
      return;
    }
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const indexOfLastCountry: number = currentPage * countriesPerPage;
  const indexOfFirstCountry: number = indexOfLastCountry - countriesPerPage;
  const currentCountries: Country[] = countries.slice(
    indexOfFirstCountry,
    indexOfLastCountry
  );

  /**
   * set pagination
   */
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const totalPages: number = Math.ceil(countries.length / countriesPerPage);

  return (
    <div className="country-table-container">
      {loading && <Loader />}
      <div className="search-box">
        <Search
          value={searchTerm}
          handleChange={handleSearchChange}
          placeholder="Search countries..."
        />
      </div>
      <div className="table-wrapper">
        <table className="country-table">
          <thead>
            <tr>
              <th
                onClick={() => {
                  sortCountries({ name: "no", label: "No." });
                  toggleSortOrder();
                }}
              >
                No.{" "}
                {sortedField?.name === "no" &&
                  (sortOrder === "asc" ? "▲" : "▼")}
              </th>
              <th
                onClick={() => {
                  sortCountries({ name: "name", label: "Country Name" });
                  toggleSortOrder();
                }}
              >
                Country Name{" "}
                {sortedField?.name === "name" &&
                  (sortOrder === "asc" ? "▲" : "▼")}
              </th>
              <th>Country Flag</th>
            </tr>
          </thead>
          <tbody>
            {searchTerm === "" && (
              <tr>
                <td colSpan={3} className="start-searching">
                  Start searching
                </td>
              </tr>
            )}
            {currentCountries?.length === 0 && searchTerm !== "" && (
              <tr>
                <td colSpan={3} className="no-results">
                  No results found
                </td>
              </tr>
            )}
            {currentCountries?.map((country, index) => (
              <tr key={index}>
                {/* <td>{(currentPage - 1) * countriesPerPage + index + 1}</td> */}
                <td>{country?.no}</td>
                <td>{country?.name}</td>
                <td>
                  <img
                    src={country?.flag}
                    alt={`Flag of ${country?.name}`}
                    width="30"
                    height="20"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {currentCountries?.length > 0 && (
          <div className="pagination">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            {Array.from({ length: totalPages }).map((_, index) => {
              const pageNumber = index + 1;
              const currentPageGroup = Math.floor((currentPage - 1) / 5) + 1;
              const isDisplayed =
                pageNumber >= (currentPageGroup - 1) * 5 + 1 &&
                pageNumber <= Math.min(currentPageGroup * 5, totalPages);
              if (isDisplayed) {
                return (
                  <button
                    key={index}
                    onClick={() => paginate(pageNumber)}
                    disabled={currentPage === pageNumber}
                  >
                    {pageNumber}
                  </button>
                );
              } else if (
                (index === (currentPageGroup - 1) * 5 ||
                  index === currentPageGroup * 5 - 1) &&
                totalPages > 5
              ) {
                return (
                  <button key={index} disabled={true}>
                    ...
                  </button>
                );
              } else {
                return null;
              }
            })}
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CountryTable;
