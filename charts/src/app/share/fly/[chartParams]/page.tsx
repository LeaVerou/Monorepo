/**
 * TODO:
 * Generate the right metadata in this page
 */

import { Metadata } from 'next'
import { redirect } from 'next/navigation'

export async function generateMetadata(): Promise<Metadata> {
    // TODO: similar to /share/static/[chartParams]
    // generate the right metadata for the chart
    // The difference is that here
    // the image URL should be "/share/fly/[chartParams]/serve"
    return {}
}
export default async function FlyChartRedirectionPage() {
    // TODO: similar to /share/static/[chartParams]
    // redirect user to the chart in context
    redirect('/')
}
