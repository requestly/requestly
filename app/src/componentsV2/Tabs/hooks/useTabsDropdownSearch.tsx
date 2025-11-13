import { renderToString } from "react-dom/server";
import { TabsEmptyState } from "../components/TabsEmptyState";
import { TabsSearchContainer } from "../components/TabsSearchContainer";

export const useTabsDropdownSearch = () => {
  const addSearchToDropdown = () => {
    const dropdownMenu = document.querySelector(".tabs-content-more-dropdown .ant-tabs-dropdown-menu");
    if (!dropdownMenu || dropdownMenu.querySelector(".tabs-search-input")) return;

    // Render and insert search box
    const searchContainer = document.createElement("div");
    searchContainer.innerHTML = renderToString(<TabsSearchContainer />);
    dropdownMenu.prepend(searchContainer);

    const searchInput = searchContainer.querySelector(".tabs-search-input") as HTMLInputElement;
    if (!searchInput) return;

    const clearFilter = () => {
      searchInput.value = "";
      searchInput.dispatchEvent(new Event("input", { bubbles: true }));
    };

    const updateSearch = (e: Event) => {
      const term = (e.target as HTMLInputElement)?.value.toLowerCase().trim() || "";
      const items = dropdownMenu.querySelectorAll<HTMLElement>(".ant-tabs-dropdown-menu-item");

      let visibleCount = 0;
      items.forEach((item) => {
        const title = item.querySelector(".tab-title .title")?.textContent?.toLowerCase() || "";
        const visible = !term || title.includes(term);
        item.style.display = visible ? "block" : "none";
        if (visible) visibleCount++;
      });

      let noResults = dropdownMenu.querySelector(".tabs-no-results") as HTMLElement | null;

      if (!visibleCount && term) {
        if (!noResults) {
          noResults = document.createElement("div");
          noResults.className = "tabs-no-results";
          noResults.innerHTML = renderToString(<TabsEmptyState onClearFilter={() => {}} />);

          const clearBtn = noResults.querySelector(".tabs-clear-filter");
          if (clearBtn) clearBtn.addEventListener("click", clearFilter);

          dropdownMenu.append(noResults);
        }
        noResults.style.display = "block";
      } else if (noResults) {
        noResults.style.display = "none";
      }
    };

    searchInput.addEventListener("input", updateSearch);

    // Focus input when dropdown opens
    requestAnimationFrame(() => searchInput.focus());

    const dropdownContainer = dropdownMenu.closest(".tabs-content-more-dropdown");
    if (dropdownContainer) {
      dropdownContainer.addEventListener("focusout", (e: FocusEvent) => {
        const nextFocused = e.relatedTarget as Node | null;
        if (!nextFocused || !dropdownContainer.contains(nextFocused)) {
          clearFilter();
        }
      });
    }

    // Cleanup handler
    const cleanup = () => {
      searchInput.removeEventListener("input", updateSearch);
      const clearBtn = dropdownMenu.querySelector(".tabs-clear-filter");
      clearBtn?.removeEventListener("click", clearFilter);
      dropdownContainer?.removeEventListener("focusout", clearFilter);
    };

    (dropdownMenu as any)._searchCleanup = cleanup;
  };

  // Observe DOM for dropdown insertion/removal
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (
          node instanceof HTMLElement &&
          (node.classList.contains("tabs-content-more-dropdown") || node.querySelector(".tabs-content-more-dropdown"))
        ) {
          requestAnimationFrame(addSearchToDropdown);
        }
      }

      for (const node of mutation.removedNodes) {
        if (node instanceof HTMLElement) {
          const menu = node.querySelector?.(".ant-tabs-dropdown-menu");
          (menu as any)?._searchCleanup?.();
        }
      }
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  return () => {
    document
      .querySelectorAll(".tabs-content-more-dropdown .ant-tabs-dropdown-menu")
      .forEach((el) => (el as any)._searchCleanup?.());
    observer.disconnect();
  };
};
