import * as React from 'react'
import { createContext, useContext } from 'react'
import { useRouter } from 'next/router'

import { Calculator, Calendar, CreditCard, Settings, Smile, User } from 'lucide-react'
import { useCommandState } from 'cmdk-supabase'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandItemStale,
  CommandLabel,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from './Command.utils'
import { IconCloudDrizzle } from '../Icon/icons/IconCloudDrizzle'
import { IconBook } from '../Icon/icons/IconBook'
import { IconInbox } from '../Icon/icons/IconInbox'
import { IconMonitor } from '../Icon/icons/IconMonitor'
import { Input } from '../Input'
import { AiCommand } from './AiCommand'
import { IconSun } from '../Icon/icons/IconSun'
import { IconMoon } from '../Icon/icons/IconMoon'
import { IconCopy } from '../Icon/icons/IconCopy'
import DocsSearch from './DocsSearch'
import { useCommandMenu } from './CommandMenuProvider'
// import { SearchProvider } from './SearchProvider'
import navItems from './command-nav-items.json'
import { NavItem } from './Command.types'
import { AiIcon } from './Command.icons'

export const COMMAND_ROUTES = {
  AI_HOME: 'Supabase AI',
  AI_ASK_ANYTHING: 'Ask me anything',
  AI_RLS_POLICY: 'Help me make a RLS policy',
  DOCS_SEARCH: 'Docs Search',
}

const AI_CHAT_ROUTES = [COMMAND_ROUTES.AI_ASK_ANYTHING, COMMAND_ROUTES.AI_RLS_POLICY]

interface IActions {
  toggleTheme: () => void
}

const iconComponents = {
  book: <IconBook />,
}

const SearchOnlyItem = (props: any) => {
  const icon = iconComponents[props.icon]
  console.log('props', props)
  const search = useCommandState((state) => state.search)
  // if search is empty & items is marked as a subItem, don't show it
  // ie: only show these items in search results, not top level
  if (!search && props.isSubItem) return null
  return <CommandItem>{props.label}</CommandItem>
}

//  <CommandItem onSelect={() => handleSetPages([...pages, 'Docs Search'], true)} forceMount>
//   <IconBook className="" />

//   <span>
//     Search the docs...
//     <span className="text-scale-1200 font-semibold">{search}</span>
//   </span>
// </CommandItem>

{
  /* <CommandItem>
  <IconInbox className="text-scale-900" />
  <CommandLabel>See what's new</CommandLabel>
</CommandItem> */
}

function CommandMenu({ actions }: { actions: IActions }) {
  const [search, setSearch] = React.useState('')
  const [aiSearch, setAiSearch] = React.useState('')
  const [pages, setPages] = React.useState([])
  const page = pages[pages.length - 1]
  const router = useRouter()
  const { isOpen, setIsOpen } = useCommandMenu()

  const ThemeOptions = ({ isSubItem = false }) => {
    return (
      <CommandGroup>
        <SearchOnlyItem
          isSubItem={isSubItem}
          onSelect={() => {
            actions.toggleTheme()
            setIsOpen(false)
          }}
        >
          Change Theme to dark
        </SearchOnlyItem>
        <SearchOnlyItem
          isSubItem={isSubItem}
          onSelect={() => {
            actions.toggleTheme()
            setIsOpen(false)
          }}
        >
          Change Theme to light
        </SearchOnlyItem>
      </CommandGroup>
    )
  }

  const SearchableChildItems = ({ isSubItem = false }) => {
    return (
      <CommandGroup>
        {/* output only subItems  */}
        {navItems.items
          .filter((item) => item.sites.includes('docs'))
          .flatMap((item) => item.subItems)
          .map((item) => (
            <SearchOnlyItem
              icon={item.icon}
              label={item.label}
              isSubItem={isSubItem}
              onSelect={() => {
                console.log('hay')
              }}
            />
          ))}
      </CommandGroup>
    )
  }

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && e.metaKey) {
        setIsOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  function handleSetPages(pages: any, keepSearch: any) {
    setPages(pages)
    if (!keepSearch) setSearch('')
  }

  console.log('page', page)

  const showCommandInput = page === undefined || !AI_CHAT_ROUTES.includes(page)

  return (
    <>
      <CommandDialog
        page={page}
        visible={isOpen}
        onOpenChange={setIsOpen}
        onCancel={() => setIsOpen(!open)}
        size={'xlarge'}
        className={'max-h-[70vh] lg:max-h-[50vh] overflow-hidden overflow-y-auto'}
        onKeyDown={(e) => {
          // Escape goes to previous page
          // Backspace goes to previous page when search is empty
          if (
            e.key === 'Escape'
            // || (e.key === 'Backspace' && !search)
          ) {
            e.preventDefault()
            if (!page) setIsOpen(false)
            setSearch('')
            setPages((pages) => pages.slice(0, -1))
          }
        }}
      >
        {pages.length > 0 && (
          <div className="flex w-full gap-2 px-4 pt-4 justify-items-start flex-row">
            <CommandShortcut onClick={() => setPages([])}>{'Home'}</CommandShortcut>
            {pages.map((page, index) => (
              <CommandShortcut
                key={page}
                onClick={() => {
                  if (index === pages.length - 1) {
                    return
                  }
                  setPages((pages) => pages.slice(0, index - 1))
                }}
              >
                {page}
              </CommandShortcut>
            ))}
          </div>
        )}
        {showCommandInput && (
          <CommandInput
            placeholder="Type a command or search..."
            value={search}
            onValueChange={setSearch}
          />
        )}
        {/* <CommandList>
          <CommandItem>Change theme…</CommandItem>
          <SubItem>Change theme to dark</SubItem>
          <SubItem>Change theme to light</SubItem>
        </CommandList> */}

        <CommandList className={['my-2', showCommandInput && 'max-h-[300px]'].join(' ')}>
          {!page && (
            <>
              <CommandGroup heading="AI commands" forceMount>
                <CommandItem
                  onSelect={() => {
                    console.log('search', search)
                    if (search) {
                      handleSetPages([...pages, 'Supabase AI', 'Ask anything'], true)
                    } else {
                      handleSetPages([...pages, 'Supabase AI'], false)
                    }
                  }}
                  forceMount
                >
                  <AiIcon />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-900 to-purple-1100">
                    Ask Supabase AI...{' '}
                    <span className="text-scale-1200 font-semibold">{search}</span>
                  </span>
                </CommandItem>
                <CommandItem
                  onSelect={() => handleSetPages([...pages, 'Docs Search'], true)}
                  forceMount
                >
                  <IconBook className="" />

                  <span>
                    Search the docs...
                    <span className="text-scale-1200 font-semibold">{search}</span>
                  </span>
                </CommandItem>
              </CommandGroup>
              <CommandGroup heading="General">
                <CommandItem>
                  <IconInbox className="text-scale-900" />
                  <CommandLabel>See what's new</CommandLabel>
                </CommandItem>
                <CommandItem onSelect={() => handleSetPages([...pages, 'Theme'], false)}>
                  <IconMonitor className="mr-2" />
                  Change theme
                </CommandItem>
                <CommandItem>
                  <IconCopy />
                  Copy current page URL
                </CommandItem>
              </CommandGroup>
              <CommandGroup heading="Settings">
                <CommandItem onSelect={() => handleSetPages([...pages, 'api-keys'], true)}>
                  <CreditCard className="text-scale-900" />
                  <CommandLabel>API keys</CommandLabel>
                  <CommandShortcut>⌘B</CommandShortcut>
                </CommandItem>
                <CommandItem>
                  <User className="text-scale-900" />
                  <CommandLabel>Profile</CommandLabel>
                  <CommandShortcut>⌘P</CommandShortcut>
                </CommandItem>
                <CommandItem>
                  <CreditCard className="text-scale-900" />
                  <CommandLabel>Billing</CommandLabel>
                  <CommandShortcut>⌘B</CommandShortcut>
                </CommandItem>
                <CommandItem>
                  <Settings className="text-scale-900" />
                  <CommandLabel>Settings</CommandLabel>
                  <CommandShortcut>⌘S</CommandShortcut>
                </CommandItem>
              </CommandGroup>
              <CommandGroup heading="Settings2">
                <CommandItem>
                  <User className="text-scale-900" />
                  <CommandLabel>Profile2</CommandLabel>
                  <CommandShortcut>⌘P</CommandShortcut>
                </CommandItem>
                <CommandItem>
                  <CreditCard className="text-scale-900" />
                  <CommandLabel>Billing2</CommandLabel>
                  <CommandShortcut>⌘B</CommandShortcut>
                </CommandItem>
                <CommandItem>
                  <Settings className="text-scale-900" />
                  <CommandLabel>Settings2</CommandLabel>
                  <CommandShortcut>⌘S</CommandShortcut>
                </CommandItem>
              </CommandGroup>

              <ThemeOptions isSubItem />
              <SearchableChildItems isSubItem />
            </>
          )}
          {page === 'docs-search' && (
            <>
              <CommandGroup heading="Database">
                <CommandItem>
                  <Settings className="text-scale-900" />
                  <CommandLabel>Something database</CommandLabel>
                  <CommandShortcut>⌘S</CommandShortcut>
                </CommandItem>
              </CommandGroup>
              <CommandGroup heading="Auth">
                <CommandItem>
                  <Settings className="text-scale-900" />
                  <CommandLabel>Something Auth</CommandLabel>
                  <CommandShortcut>⌘S</CommandShortcut>
                </CommandItem>
                <CommandItem>
                  <Settings className="text-scale-900" />
                  <CommandLabel>Something Auth 2</CommandLabel>
                  <CommandShortcut>⌘S</CommandShortcut>
                </CommandItem>
              </CommandGroup>
            </>
          )}
          {page === COMMAND_ROUTES.AI_ASK_ANYTHING && (
            <>
              <AiCommand query={search} setQuery={setSearch} page={page} />
            </>
          )}
          {page === COMMAND_ROUTES.DOCS_SEARCH && (
            <>
              <DocsSearch query={search} setQuery={setSearch} page={page} router={router} />
            </>
          )}
          {page === COMMAND_ROUTES.AI_RLS_POLICY && (
            <>
              <AiCommand query={search} setQuery={setSearch} page={page} />
            </>
          )}
          {page === 'api-keys' && (
            <>
              <CommandGroup heading="">
                <CommandItem>
                  <Settings className="text-scale-900" />
                  <CommandLabel>Copy Anon key</CommandLabel>
                  <CommandShortcut>⌘S</CommandShortcut>
                </CommandItem>
              </CommandGroup>
              <div className="w-full flex">
                <code className="bg-scale-100 rounded mx-2 px-2 w-full text-scale-1200 text-sm py-3">
                  I AM SOME KEYS I AM SOME KEYS I AM SOME KEYS I AM SOME KEYS I AM SOME KEYS I AM
                </code>
              </div>
              <CommandGroup heading="">
                <CommandItem>
                  <Settings className="text-scale-900" />
                  <CommandLabel>Copy Service role key</CommandLabel>
                  <CommandShortcut>⌘S</CommandShortcut>
                </CommandItem>
              </CommandGroup>
              <div className="w-full flex">
                <code className="bg-scale-100 rounded mx-2 px-2 w-full text-scale-1200 text-sm py-3">
                  I AM SOME KEYS I AM SOME KEYS I AM SOME KEYS I AM SOME KEYS I AM SOME KEYS I AM
                </code>
              </div>
              <CommandGroup heading="">
                <CommandItem>
                  <Settings className="text-scale-900" />
                  <CommandLabel>Roll new keys</CommandLabel>
                  <CommandShortcut>⌘S</CommandShortcut>
                </CommandItem>
                <CommandItem>
                  <Settings className="text-scale-900" />
                  <CommandLabel>Switch project</CommandLabel>
                  <CommandShortcut>⌘S</CommandShortcut>
                </CommandItem>
              </CommandGroup>
            </>
          )}

          {page === 'Supabase AI' && (
            <>
              <CommandGroup forceMount>
                <CommandItem
                  onSelect={() => handleSetPages([...pages, COMMAND_ROUTES.AI_ASK_ANYTHING], true)}
                  forceMount
                >
                  <AiIcon />
                  <CommandLabel className="text-transparent bg-clip-text bg-gradient-to-r from-purple-900 to-purple-1100">
                    Ask Supabase AI...{' '}
                    <span className="text-scale-1200 font-semibold">{search}</span>
                  </CommandLabel>
                </CommandItem>
                <CommandItem
                  onSelect={() => handleSetPages([...pages, COMMAND_ROUTES.AI_RLS_POLICY], false)}
                >
                  <AiIcon />
                  <CommandLabel>Help me make an RLS policy</CommandLabel>
                </CommandItem>
                <CommandItem>
                  <AiIcon />
                  <CommandLabel>Help me make an Postgres function</CommandLabel>
                </CommandItem>
                <CommandItem>
                  <AiIcon />
                  <CommandLabel>Help me make an Postgres trigger</CommandLabel>
                </CommandItem>
                <CommandItem>
                  <AiIcon />
                  <CommandLabel>Help me make a table</CommandLabel>
                </CommandItem>
              </CommandGroup>
            </>
          )}
          {page === 'Theme' && (
            <>
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    router.push('https://supabase.com/docs')
                    setIsOpen(false)
                  }}
                >
                  <CommandLabel>Grab api keys</CommandLabel>
                </CommandItem>
              </CommandGroup>
              <ThemeOptions />
            </>
          )}
          {page !== 'Ask anything' || (!page && <CommandEmpty>No results found.</CommandEmpty>)}
        </CommandList>
      </CommandDialog>
      {/* <AiCommand /> */}
    </>
  )
}

export { CommandMenu }