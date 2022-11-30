"use client";
import { Loading } from "~/core/components/ui/Loading";
import {
  VulcanComponentsProvider,
  VulcanCurrentUserProvider,
} from "@vulcanjs/react-ui";
import { defaultCoreComponents } from "@vulcanjs/react-ui";
import {
  Alert,
  TooltipTrigger,
  liteCoreComponents,
} from "@vulcanjs/react-ui-lite";
import { bootstrapCoreComponents } from "@vulcanjs/react-ui-bootstrap";

import debug from "debug";

const debugPerf = debug("vns:perf");
// @see https://nextjs.org/docs/advanced-features/measuring-performance
/*
TODO: planned in v13 but not yet available 2022/11
export function reportWebVitals(metric) {
  debugPerf(metric); // The metric object ({ id, name, startTime, value, label }) is logged to the console
}
*/

import { ApolloProvider } from "@apollo/client";
import { useApollo } from "@vulcanjs/next-apollo";
import { useUser } from "~/account/user/hooks";

import { LocaleContextProvider } from "~/i18n/components/LocaleContext";

import { FormattedMessage } from "~/core/components/common/FormattedMessage";

import { ErrorBoundary } from "~/core/components/error";
import { getAppGraphqlUri } from "~/lib/graphql";
import Layout from "~/core/components/common/Layout";
import type { LocaleDef } from "~/i18n/typings";
import { SSRProvider } from "react-bootstrap";

export interface AppLayoutProps {
  /** Locale extracted from cookies server-side */
  locale: string;
  localeStrings: LocaleDef;
  locales?: Array<LocaleDef>;
  initialApolloState?: any;
  // When on a specific survey
  // TODO: will be handled by a nested layout later on
  year?: string;
  slug?: string;
  children: React.ReactNode;
}

export function AppLayout(props: AppLayoutProps) {
  const {
    children,
    initialApolloState,
    locale,
    locales,
    localeStrings,
    slug,
    year,
  } = props;
  const apolloClient = useApollo(initialApolloState, {
    graphqlUri: getAppGraphqlUri(/*origin*/),
    crossDomainGraphqlUri:
      !!process.env.NEXT_PUBLIC_CROSS_DOMAIN_GRAPHQL_URI || false,
  }); // you can also easily setup ApolloProvider on a per-page basis
  // Use the layout defined at the page level, if available
  // @see https://nextjs.org/docs/basic-features/layouts
  const { user } = useUser();

  return (
    <SSRProvider>
      <ErrorBoundary proposeReload={true} proposeHomeRedirection={true}>
        {/** TODO: this error boundary to display anything useful since it doesn't have i18n */}
        {
          <ApolloProvider client={apolloClient}>
            <LocaleContextProvider
              locales={locales}
              localeId={locale}
              localeStrings={localeStrings}
              currentUser={user}
            >
              <VulcanCurrentUserProvider
                // @ts-ignore FIXME: weird error with groups
                value={{
                  currentUser: user || null,
                  loading:
                    false /* TODO: we don't get the loading information from useUser yet */,
                }}
              >
                <VulcanComponentsProvider
                  value={{
                    ...defaultCoreComponents,
                    ...liteCoreComponents,
                    Alert,
                    // TODO: should not be needed, since we use Bootstrap Button instead,
                    // but need double checking
                    // Button,
                    TooltipTrigger,
                    Loading,
                    ...bootstrapCoreComponents,
                    // Keep the component here even if we don't use Components.FormattedMessage directly
                    // This allows Vulcan components to depend on it
                    FormattedMessage,
                  }}
                >
                  <ErrorBoundary
                    proposeReload={true}
                    proposeHomeRedirection={true}
                  >
                    <Layout surveySlug={slug} surveyYear={year}>
                      {children}
                    </Layout>
                  </ErrorBoundary>
                </VulcanComponentsProvider>
              </VulcanCurrentUserProvider>
            </LocaleContextProvider>
          </ApolloProvider>
        }
      </ErrorBoundary>
    </SSRProvider>
  );
}
