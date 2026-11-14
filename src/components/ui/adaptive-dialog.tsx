"use client";

import {
  useState,
  useSyncExternalStore,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from "react";
import { Dialog } from "@base-ui/react/dialog";
import { Drawer } from "@base-ui/react/drawer";
import { XMarkIcon } from "@heroicons/react/16/solid";
import { cn } from "@/lib/utils";

const PHONE = "(width < 48rem)";

function subscribe(onChange: () => void) {
  const query = matchMedia(PHONE);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function useIsPhone() {
  return useSyncExternalStore(
    subscribe,
    () => matchMedia(PHONE).matches,
    () => false,
  );
}

interface AdaptiveDialogProps {
  trigger: ReactElement;
  triggerChildren?: ReactNode;
  disabled?: boolean;
  title: ReactNode;
  description?: ReactNode;
  variant?: "info" | "confirm";
  destructive?: boolean;
  /** Footer actions. Order them Cancel, then confirm. */
  footer?: (close: () => void) => ReactNode;
  initialFocus?: RefObject<HTMLElement | null>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
}

/** A centred modal on desktop, a swipeable bottom sheet on a phone. */
export function AdaptiveDialog({
  trigger,
  triggerChildren,
  disabled,
  title,
  description,
  variant = "info",
  destructive = false,
  footer,
  initialFocus,
  open: openProp,
  onOpenChange,
  children,
}: AdaptiveDialogProps) {
  const isPhone = useIsPhone();
  const [openState, setOpenState] = useState(false);
  const open = openProp ?? openState;
  const setOpen = (next: boolean) => {
    setOpenState(next);
    onOpenChange?.(next);
  };
  const close = () => setOpen(false);

  const titleClass = destructive ? "text-[var(--red-11)]" : "text-ink-12";
  // Only override the role for confirms: passing `role={undefined}` would wipe
  // Base UI's own role="dialog".
  const roleProps = variant === "confirm" ? { role: "alertdialog" } : {};

  if (isPhone) {
    return (
      <Drawer.Root open={open} onOpenChange={setOpen} swipeDirection="down">
        <Drawer.Trigger render={trigger} disabled={disabled}>
          {triggerChildren}
        </Drawer.Trigger>
        <Drawer.Portal>
          <Drawer.Backdrop className="fixed inset-0 z-50 min-h-dvh bg-black opacity-[calc(0.3*(1-var(--drawer-swipe-progress)))] backdrop-blur-[2px] transition-opacity duration-[320ms] ease-out data-swiping:duration-0 data-starting-style:opacity-0 data-ending-style:opacity-0 data-ending-style:duration-200" />
          <Drawer.Viewport className="fixed inset-0 z-50 flex items-end justify-center">
            <Drawer.Popup
              initialFocus={initialFocus}
              {...roleProps}
              className="relative flex max-h-[calc(100dvh-env(safe-area-inset-top)-24px)] w-full flex-col rounded-t-[14px] bg-surface-top pb-[max(24px,calc(12px+env(safe-area-inset-bottom)))] outline-none [transform:translateY(var(--drawer-swipe-movement-y))] transition-transform duration-[320ms] ease-[var(--ease-drawer)] data-swiping:select-none data-starting-style:[transform:translateY(calc(100%+48px))] data-ending-style:[transform:translateY(calc(100%+48px))] data-ending-style:duration-200 motion-reduce:transition-opacity motion-reduce:data-starting-style:[transform:none] motion-reduce:data-starting-style:opacity-0 motion-reduce:data-ending-style:[transform:none] motion-reduce:data-ending-style:opacity-0"
            >
              <Drawer.Close
                aria-label="Close"
                className="group absolute -top-[36.5px] left-1/2 grid h-11 w-[88px] -translate-x-1/2 place-items-center outline-none"
              >
                <span className="block h-[5px] w-9 rounded-full bg-white transition-[scale] duration-150 ease-out group-active:scale-[0.94] group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-white" />
              </Drawer.Close>

              <div className="px-5 pt-5">
                <Drawer.Title
                  className={cn(
                    "text-xl font-medium tracking-tight",
                    titleClass,
                  )}
                >
                  {title}
                </Drawer.Title>
                {description && (
                  <Drawer.Description className="mt-1.5 text-sm text-ink-11">
                    {description}
                  </Drawer.Description>
                )}
              </div>

              {children && (
                <Drawer.Content className="mt-6 min-h-0 flex-1 overflow-y-auto overscroll-contain px-5">
                  {children}
                </Drawer.Content>
              )}

              {footer && (
                <div className="mt-6 flex flex-col-reverse gap-2 px-5 [&>*]:w-full">
                  {footer(close)}
                </div>
              )}
            </Drawer.Popup>
          </Drawer.Viewport>
        </Drawer.Portal>
      </Drawer.Root>
    );
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger render={trigger} disabled={disabled}>
        {triggerChildren}
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/30 backdrop-blur-[2px] transition-opacity duration-200 ease-out data-starting-style:opacity-0 data-ending-style:opacity-0" />
        <Dialog.Popup
          initialFocus={initialFocus}
          {...roleProps}
          className={cn(
            "fixed top-1/2 left-1/2 z-50 flex max-h-[calc(100dvh-32px)] w-[calc(100%-32px)] flex-col overflow-hidden rounded-[28px] bg-surface-top outline-none",
            "[translate:-50%_-50%] transition-[opacity,translate,filter] duration-[240ms] ease-out",
            "data-starting-style:opacity-0 data-starting-style:blur-[4px] data-starting-style:[translate:-50%_calc(-50%+16px)]",
            "data-ending-style:opacity-0 data-ending-style:blur-[4px] data-ending-style:[translate:-50%_calc(-50%+16px)] data-ending-style:duration-200",
            "motion-reduce:data-starting-style:[translate:-50%_-50%] motion-reduce:data-starting-style:blur-none motion-reduce:data-ending-style:[translate:-50%_-50%] motion-reduce:data-ending-style:blur-none",
            variant === "confirm" ? "max-w-[460px]" : "max-w-[448px]",
          )}
        >
          <div
            className={cn(
              "px-5 pt-5",
              children || footer ? "pb-2" : "pb-5",
              variant === "info" && "pr-12",
            )}
          >
            <Dialog.Title className={cn("text-base font-medium", titleClass)}>
              {title}
            </Dialog.Title>
            {description && (
              <Dialog.Description className="mt-1 text-sm text-ink-11">
                {description}
              </Dialog.Description>
            )}
          </div>

          {variant === "info" && (
            <Dialog.Close
              aria-label="Close"
              className="absolute top-5 right-5 grid size-[22px] place-items-center rounded-md text-ink-10 outline-none transition-[scale,background-color,color] duration-150 ease-out hover:bg-ink-3 hover:text-ink-12 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus-ring active:scale-[0.92]"
            >
              <XMarkIcon className="size-4" />
            </Dialog.Close>
          )}

          {children && (
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pt-4 pb-5">
              {children}
            </div>
          )}

          {footer && (
            <div className="flex justify-between gap-3 px-5 pt-4 pb-5">
              {footer(close)}
            </div>
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
