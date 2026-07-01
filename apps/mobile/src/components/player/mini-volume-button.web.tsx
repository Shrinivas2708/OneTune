import { Ionicons } from "@expo/vector-icons";
import { useCallback, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Pressable, View, type View as ViewType } from "react-native";
import { usePlayerStore } from "@/stores/player-store";
import { VerticalVolumeControl } from "./vertical-volume-control";

interface PopoverPosition {
  left: number;
  bottom: number;
}

export function MiniVolumeButton() {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<PopoverPosition | null>(null);
  const anchorRef = useRef<ViewType>(null);
  const volume = usePlayerStore((state) => state.volume);

  const openPopover = useCallback(() => {
    anchorRef.current?.measureInWindow((x, y, width, height) => {
      const viewportHeight =
        typeof window !== "undefined" ? window.innerHeight : 0;

      setPosition({
        left: Math.max(12, x + width / 2 - 22),
        bottom: Math.max(72, viewportHeight - y + 8),
      });
      setOpen(true);
    });
  }, []);

  const toggle = useCallback(() => {
    if (open) {
      setOpen(false);
      return;
    }

    openPopover();
  }, [open, openPopover]);

  const iconName =
    volume === 0 ? "volume-mute" : volume < 0.35 ? "volume-low" : "volume-high";

  const popover =
    open && position && typeof document !== "undefined"
      ? createPortal(
          <>
            <Pressable
              accessibilityLabel="Close volume"
              style={{
                position: "fixed",
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
                zIndex: 9998,
              }}
              onPress={() => setOpen(false)}
            />
            <View
              style={{
                position: "fixed",
                left: position.left,
                bottom: position.bottom,
                zIndex: 9999,
              }}
            >
              <VerticalVolumeControl height={112} />
            </View>
          </>,
          document.body,
        )
      : null;

  return (
    <>
      <View ref={anchorRef} collapsable={false}>
        <Pressable
          accessibilityLabel="Adjust volume"
          accessibilityRole="button"
          className="h-8 w-8 items-center justify-center"
          hitSlop={6}
          onPress={toggle}
        >
          <Ionicons color={open ? "#1ed760" : "#b3b3b3"} name={iconName} size={18} />
        </Pressable>
      </View>
      {popover}
    </>
  );
}
