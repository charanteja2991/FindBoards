import { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, LogOut, Megaphone, Menu, Plus, Building2, Heart, UserRound, Inbox, CalendarCheck } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const navLink = "rounded-lg px-3 py-2 text-muted-foreground transition hover:text-foreground";
const navActive = "rounded-lg px-3 py-2 text-foreground font-medium";

export function SiteHeader() {
  const { user, signOut, isOwner } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [signOutConfirmOpen, setSignOutConfirmOpen] = useState(false);
  const [requestCount, setRequestCount] = useState(0);

  useEffect(() => {
    if (!user) {
      setRequestCount(0);
      return;
    }
    const fetchCount = async () => {
      if (!user) {
        setRequestCount(0);
        return;
      }
      if (isOwner) {
        if (location.pathname === "/owner/requests") {
          setRequestCount(0);
          return;
        }
        const { count } = await supabase
          .from("booking_requests")
          .select("*", { count: "exact", head: true })
          .eq("owner_id", user.id)
          .eq("status", "pending");
        setRequestCount(count || 0);
      } else {
        if (location.pathname === "/advertiser/requests") {
          setRequestCount(0);
          localStorage.setItem(`advertiser_requests_viewed_at_${user.id}`, new Date().toISOString());
          return;
        }

        const viewedAt = localStorage.getItem(`advertiser_requests_viewed_at_${user.id}`);
        const { data, error } = await supabase
          .from("booking_requests")
          .select("id, status, responded_at, updated_at")
          .eq("advertiser_id", user.id)
          .in("status", ["accepted", "declined"]);

        if (error || !data) {
          setRequestCount(0);
        } else {
          const viewedTime = viewedAt ? new Date(viewedAt).getTime() : 0;
          const unviewedCount = data.filter((req: any) => {
            const respTime = req.responded_at
              ? new Date(req.responded_at).getTime()
              : req.updated_at
              ? new Date(req.updated_at).getTime()
              : 0;
            return respTime > viewedTime;
          }).length;
          setRequestCount(unviewedCount);
        }
      }
    };
    fetchCount();
  }, [user, isOwner, location.pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-lg bg-brand text-primary-foreground">
            <Megaphone className="size-4" />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">FindBoards</span>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-1 text-sm font-medium md:flex">
          <NavLink to="/browse" className={({ isActive }) => (isActive ? navActive : navLink)}>
            Browse
          </NavLink>

          {user ? (
            <>
              {isOwner ? (
                <>
                  <NavLink to="/dashboard" className={({ isActive }) => (isActive ? navActive : navLink)}>
                    Dashboard
                  </NavLink>
                  <NavLink to="/my-billboards" className={({ isActive }) => (isActive ? navActive : navLink)}>
                    My Billboards
                  </NavLink>
                  <NavLink to="/owner/requests" className={({ isActive }) => `${isActive ? navActive : navLink} relative`}>
                    Requests
                    {requestCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white shadow-sm">
                        {requestCount}
                      </span>
                    )}
                  </NavLink>
                </>
              ) : (
                <>
                  <NavLink to="/saved" className={({ isActive }) => (isActive ? navActive : navLink)}>
                    Saved
                  </NavLink>
                  <NavLink to="/advertiser/requests" className={({ isActive }) => `${isActive ? navActive : navLink} relative`}>
                    Requests
                    {requestCount > 0 && (
                      <span className="absolute top-2 right-1.5 size-2.5 rounded-full bg-accent ring-2 ring-card shadow-sm" />
                    )}
                  </NavLink>
                </>
              )}

              {isOwner && (
                <Button asChild size="sm" className="ml-2 bg-brand hover:bg-brand-dark">
                  <Link to="/billboards/new">
                    <Plus className="mr-1 size-4" /> Add Billboard
                  </Link>
                </Button>
              )}

              <button
                type="button"
                onClick={() => setSignOutConfirmOpen(true)}
                className="ml-2 rounded-lg border border-border px-3 py-2 transition hover:border-brand/40 text-muted-foreground hover:text-foreground"
              >
                Sign out
              </button>
            </>
          ) : (
            <Button asChild className="ml-2 bg-accent text-accent-foreground hover:brightness-95">
              <Link to="/auth">Sign In</Link>
            </Button>
          )}
        </nav>

        {/* Mobile navigation */}
        <div className="md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Open menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle className="font-display">Menu</SheetTitle>
              </SheetHeader>
              <div className="mt-6 flex flex-col gap-1 text-sm font-medium">
                <Link to="/browse" className={navLink} onClick={() => setOpen(false)}>
                  Browse billboards
                </Link>

                {user && (
                  <>
                    {isOwner ? (
                      <>
                        <Link to="/dashboard" className={navLink} onClick={() => setOpen(false)}>
                          <span className="inline-flex items-center gap-2">
                            <LayoutDashboard className="size-4" /> Dashboard
                          </span>
                        </Link>
                        <Link to="/my-billboards" className={navLink} onClick={() => setOpen(false)}>
                          <span className="inline-flex items-center gap-2">
                            <Building2 className="size-4" /> My billboards
                          </span>
                        </Link>
                        <Link to="/owner/requests" className={navLink} onClick={() => setOpen(false)}>
                          <span className="inline-flex items-center justify-between w-full">
                            <span className="inline-flex items-center gap-2">
                              <Inbox className="size-4" /> Booking requests
                            </span>
                            {requestCount > 0 && (
                              <span className="flex size-5 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white">
                                {requestCount}
                              </span>
                            )}
                          </span>
                        </Link>
                        <Link to="/billboards/new" className={navLink} onClick={() => setOpen(false)}>
                          <span className="inline-flex items-center gap-2 text-brand">
                            <Plus className="size-4" /> Add billboard
                          </span>
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link to="/saved" className={navLink} onClick={() => setOpen(false)}>
                          <span className="inline-flex items-center gap-2"><Heart className="size-4" /> Saved billboards</span>
                        </Link>
                        <Link to="/advertiser/requests" className={navLink} onClick={() => setOpen(false)}>
                          <span className="inline-flex items-center justify-between w-full">
                            <span className="inline-flex items-center gap-2">
                              <CalendarCheck className="size-4" /> My requests
                            </span>
                            {requestCount > 0 && (
                              <span className="size-2.5 rounded-full bg-accent" />
                            )}
                          </span>
                        </Link>
                      </>
                    )}
                    <Link to="/profile" className={navLink} onClick={() => setOpen(false)}>
                      <span className="inline-flex items-center gap-2"><UserRound className="size-4" /> Profile</span>
                    </Link>
                  </>
                )}

                <div className="mt-4 border-t border-border pt-4">
                  {user ? (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setOpen(false);
                        setSignOutConfirmOpen(true);
                      }}
                    >
                      <LogOut className="mr-2 size-4" /> Sign out
                    </Button>
                  ) : (
                    <Button asChild className="w-full">
                      <Link to="/auth" onClick={() => setOpen(false)}>
                        Sign in
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Sign Out Confirmation Dialog */}
      <Dialog open={signOutConfirmOpen} onOpenChange={setSignOutConfirmOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Sign out</DialogTitle>
            <DialogDescription>
              Are you sure you want to sign out of FindBoards?
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setSignOutConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-brand hover:bg-brand-dark text-white"
              onClick={() => {
                setSignOutConfirmOpen(false);
                void signOut();
              }}
            >
              Sign Out
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-card">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} FindBoards — outdoor advertising marketplace.</p>
        <Link to="/browse" className="font-medium text-brand hover:text-brand-dark">
          Browse available billboards
        </Link>
      </div>
    </footer>
  );
}
