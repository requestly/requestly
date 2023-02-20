import { useState, useEffect, ReactNode } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Command } from "cmdk";
import fuzzysort from "fuzzysort";

import { BreadCrumb } from "./BreadCrumb";
import { Footer } from "./Footer";
import { getAllRules, getUserAuthDetails, getAppMode } from "store/selectors";
import {
  trackCommandBarToggled,
  trackCommandBarActionSelected,
} from "modules/analytics/events/misc/commandBar";
import "./index.css";
import { config } from "./config";
import { CommandBarItem, CommandItemType, PageConfig, Page } from "./types";

export const CommandBar = () => {
  const [open, setOpen] = useState(false);
  const [pagesStack, setPagesStack] = useState<Page[]>([Page.HOME]);
  const [search, setSearch] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const rules = useSelector(getAllRules);
  const user = useSelector(getUserAuthDetails);
  const appMode = useSelector(getAppMode);

  let currentPage = pagesStack[pagesStack.length - 1];

  useEffect(() => {
    const down = (e: any) => {
      if (e.key === "k" && e.metaKey) {
        setOpen((open) => !open);
      }
    };
    const exit = (e: any) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", down);
    document.addEventListener("keydown", exit);

    return () => {
      document.removeEventListener("keydown", down);
      document.removeEventListener("keydown", exit);
    };
  }, []);

  useEffect(() => {
    const exit = (e: any) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", exit);
    return () => document.removeEventListener("keydown", exit);
  }, []);

  useEffect(() => {
    if (!open) {
      setPagesStack([Page.HOME]);
      setSearch("");
    } else {
      trackCommandBarToggled();
    }
  }, [open]);

  const renderItems = (items: CommandBarItem[]) => {
    return items.map((item, index) => {
      return renderItem(item);
    });
  };

  const renderItem = (item: CommandBarItem): ReactNode | null => {
    switch (item?.type) {
      case CommandItemType.GROUP:
        return renderGroupItem(item);
      default:
        return renderDefaultItem(item);
    }
  };

  const renderTitle = (item: CommandBarItem) =>
    typeof item.title === "function"
      ? item.title({ user, appMode, rules })
      : item.title;

  const renderGroupItem = (item: CommandBarItem): ReactNode | null => {
    if (typeof item.title === "function" && !item.title({ user, appMode })) {
      return null;
    }
    if (item?.children && item?.children.length > 0) {
      return (
        <Command.Group heading={renderTitle(item)} key={item.id}>
          {renderItems(item.children)}
        </Command.Group>
      );
    }
    // Error rendering CommandBar Group
    return null;
  };

  const renderDefaultItem = (item: CommandBarItem): ReactNode | null => {
    if (item) {
      if (
        typeof item.title === "function" &&
        !item.title({ user, appMode, rules })
      ) {
        return null;
      }
      return (
        <Command.Item
          value={item.id}
          key={item.id}
          onSelect={() => {
            if (item?.action) {
              item.action({ navigate, dispatch, user, appMode, rules });
              trackCommandBarActionSelected(item.id.split(" ").join("_"));
              setOpen(false);
            }

            if (item?.nextPage) {
              setPagesStack([...pagesStack, item?.nextPage]);
              setSearch("");
            }
          }}
        >
          <>
            {item?.icon ? item?.icon : null}
            {renderTitle(item)}
          </>
        </Command.Item>
      );
    }

    // Error rendering CommandBar Group
    return null;
  };

  const renderAsyncPage = (fetcher: Function): ReactNode => {
    const items = fetcher(rules);
    return renderItems(items);
  };

  return (
    <>
      {open && (
        <div className="cmdk-overlay" onClick={() => setOpen(false)}>
          <Command
            onClick={(e) => e.stopPropagation()}
            label="Global Command Menu"
            className="dialog"
            filter={(value, search) => {
              const result = fuzzysort.single(search, value);
              return result?.score ? (result?.score + 1000) / 1000 : 0;
            }}
            onKeyDown={(e) => {
              if (e.key === "Backspace" && !search) {
                e.preventDefault();
                if (pagesStack.length > 1) {
                  setPagesStack((pagesStack) => pagesStack.slice(0, -1));
                }
              }
            }}
          >
            <div className="cmd-list-wrapper">
              <BreadCrumb pages={pagesStack} />
              <Command.Input
                autoFocus={true}
                value={search}
                onValueChange={setSearch}
                placeholder="Explore Requestly"
              />
              <Command.List>
                {config.map((page: PageConfig) => {
                  if (currentPage === page?.id) {
                    if (page?.itemsFetcher) {
                      return renderAsyncPage(page.itemsFetcher);
                    }
                    return renderItems(page.items);
                  }
                  return null;
                })}
                <Command.Empty>No results found.</Command.Empty>
              </Command.List>
            </div>
            <Footer />
          </Command>
        </div>
      )}
    </>
  );
};
