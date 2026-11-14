
"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  activeCategories,
  categoryPath,
} from "@/lib/productCatalogue";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

export default function ProductCategoryMenu({
  active,
  mobile = false,
  onNavigate,
}) {
  const [expanded, setExpanded] = useState(false);
  const [categories, setCategories] = useState([]);
  const [state, setState] = useState("loading");

  const root = useRef(null);
  const trigger = useRef(null);
  const panel = useRef(null);
  const panelId = useId();

  // Fetch dynamic active categories
  useEffect(() => {
    const controller = new AbortController();

    fetch(`${API_BASE}/api/product-categories`, {
      signal: AbortSignal.any([
        controller.signal,
        AbortSignal.timeout(10000),
      ]),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Categories unavailable.");
        }
        return response.json();
      })
      .then((data) => {
        if (controller.signal.aborted) return;

        setCategories(activeCategories(data));
        setState("ready");
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setState("error");
        }
      });

    return () => controller.abort();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!expanded) return;

    const closeOutside = (event) => {
      if (!root.current?.contains(event.target)) {
        setExpanded(false);
      }
    };

    document.addEventListener("pointerdown", closeOutside);

    return () => {
      document.removeEventListener(
        "pointerdown",
        closeOutside
      );
    };
  }, [expanded]);

  const navigate = () => {
    setExpanded(false);
    onNavigate?.();
  };

  // Keyboard accessibility
  const handleKeys = (event) => {
    if (event.key === "Escape" && expanded) {
      event.preventDefault();
      event.stopPropagation();

      setExpanded(false);
      trigger.current?.focus();
      return;
    }

    const keys = ["ArrowDown", "ArrowUp", "Home", "End"];

    if (!keys.includes(event.key)) return;

    if (event.target === trigger.current) {
      event.preventDefault();
      setExpanded(true);

      requestAnimationFrame(() => {
        const links = panel.current?.querySelectorAll("a");

        if (!links?.length) return;

        const index =
          event.key === "ArrowUp" || event.key === "End"
            ? links.length - 1
            : 0;

        links[index]?.focus();
      });

      return;
    }

    if (
      !expanded ||
      !panel.current?.contains(event.target)
    ) {
      return;
    }

    const links = Array.from(
      panel.current.querySelectorAll("a")
    );

    if (!links.length) return;

    event.preventDefault();

    const index = links.indexOf(document.activeElement);

    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? links.length - 1
          : (
              index +
              (event.key === "ArrowDown" ? 1 : -1) +
              links.length
            ) % links.length;

    links[next]?.focus();
  };

  return (
    <li
      ref={root}
      className="relative"
      onMouseEnter={() => {
        if (!mobile) setExpanded(true);
      }}
      onMouseLeave={() => {
        if (
          !mobile &&
          !root.current?.contains(document.activeElement)
        ) {
          setExpanded(false);
        }
      }}
      onBlur={(event) => {
        if (
          !event.currentTarget.contains(
            event.relatedTarget
          )
        ) {
          setExpanded(false);
        }
      }}
      onKeyDown={handleKeys}
    >
      {/* PRODUCTS TEXT + ARROW = SINGLE BUTTON */}
      <button
        ref={trigger}
        type="button"
        aria-label="Products categories"
        aria-haspopup="true"
        aria-expanded={expanded}
        aria-controls={panelId}
        aria-current={active ? "page" : undefined}
        onClick={() => {
          setExpanded((value) => !value);
        }}
        className={`flex items-center gap-1 rounded-md font-['Poppins'] text-sm font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-orange-500 ${
          active
            ? "text-orange-500"
            : "text-black hover:text-orange-500"
        }`}
      >
        <span>Products</span>

        <ChevronDown
          aria-hidden="true"
          size={16}
          className={`transition-transform duration-200 ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* DYNAMIC CATEGORY DROPDOWN */}
      <div
        id={panelId}
        ref={panel}
        hidden={!expanded}
        className={
          mobile
            ? "mt-2 max-h-[55vh] overflow-y-auto rounded-lg bg-gray-50 p-2"
            : "absolute left-0 top-full z-50 max-h-[70vh] w-72 overflow-y-auto rounded-lg border border-black/5 bg-white p-2 shadow-xl"
        }
      >
        {state === "loading" && (
          <p
            role="status"
            className="px-4 py-3 text-xs text-gray-500"
          >
            Loading categories...
          </p>
        )}

        {state === "error" && (
          <div className="px-4 py-3">
            <p
              role="status"
              className="text-xs leading-5 text-gray-500"
            >
              Categories are temporarily unavailable.
              Please try again later.
            </p>
          </div>
        )}

        {state === "ready" && categories.length === 0 && (
          <p className="px-4 py-3 text-xs text-gray-500">
            No categories available.
          </p>
        )}

        {state === "ready" &&
          categories.map((category) => (
            <Link
              key={category._id}
              href={categoryPath(category)}
              onClick={navigate}
              className="block rounded-md px-4 py-3 text-sm text-[#1d2b3a] transition-colors hover:bg-orange-50 hover:text-orange-500 focus-visible:outline-2 focus-visible:outline-orange-500"
            >
              {category.name}
            </Link>
          ))}
      </div>
    </li>
  );
}
