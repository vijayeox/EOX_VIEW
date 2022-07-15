import { Menu, MenuItem, MenuSelectEvent } from "@progress/kendo-react-layout";
import { Popup } from "@progress/kendo-react-popup";
import React, { useEffect, useMemo } from "react";
interface M extends MouseEvent {
  path: any[];
}
interface Props {
  offset: { left: number; top: number };
  onClick?: () => (event: MenuSelectEvent) => void;
  menus?: { text: string; icon?: string; disabled?: boolean }[];
  onClose?: () => void;
  children?: React.ReactNode;
}
export default function PopupContext({
  offset,
  onClick,
  menus,
  onClose,
  children,
}: Props) {
  const id = useMemo(Math.random, []);
  const onMouseDown = (event :M ) => {
    const path = event.path ||event.composedPath?.() || [];
    !!!path?.find((p) => `${p.id}` === `${id}`) && onClose?.();
  };
  useEffect(() => {
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  return (
    <Popup offset={offset} show={true} id={`${id}`}>
      {(menus && (
        <Menu
          vertical={true}
          style={{ display: "inline-block" }}
          onSelect={onClick}
        >
          {menus?.map(({ text, icon, disabled }, i) => (
            <MenuItem
              disabled={disabled}
              text={text}
              key={i}
              render={() => {
                return (
                  <div style={{ padding: "5px" }}>
                    <i style={{ marginRight: "5px" }} className={icon}></i>
                    {text}
                  </div>
                );
              }}
            />
          ))}
        </Menu>
      )) ||
        children ||
        null}
    </Popup>
  );
}
