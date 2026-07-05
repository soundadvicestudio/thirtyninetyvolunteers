import 'server-only'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { formatCT } from '@/lib/utils/date'
import type { VolunteerListRow } from '@/types/volunteer'

const NAVY = '#293994'
const LIGHT_NAVY = '#EEF1FA'
const DARK = '#1A1A1A'
const MID_GRAY = '#555555'
const WHITE = '#FFFFFF'

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 8,
  },
  logoText: {
    color: NAVY,
    fontFamily: 'Helvetica-Bold',
    fontSize: 18,
  },
  title: {
    color: DARK,
    fontSize: 13,
    marginTop: 4,
  },
  generated: {
    color: MID_GRAY,
    fontSize: 9,
    marginTop: 6,
  },
  filters: {
    color: MID_GRAY,
    fontSize: 9,
    fontStyle: 'italic',
    marginTop: 2,
  },
  table: {
    marginTop: 14,
  },
  row: {
    flexDirection: 'row',
  },
  headerRow: {
    backgroundColor: NAVY,
  },
  headerCell: {
    color: WHITE,
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  cell: {
    color: DARK,
    fontSize: 8,
    paddingVertical: 5,
    paddingHorizontal: 4,
  },
  rowWhite: {
    backgroundColor: WHITE,
  },
  rowShaded: {
    backgroundColor: LIGHT_NAVY,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    right: 30,
    fontSize: 9,
    color: MID_GRAY,
  },
  colName: { width: '17%' },
  colEmail: { width: '17%' },
  colPhone: { width: '12%' },
  colServiceHours: { width: '6%' },
  colCategories: { width: '18%' },
  colHours: { width: '6%' },
  colCalls: { width: '6%' },
  colStatus: { width: '8%' },
  colJoined: { width: '10%' },
})

export type VolunteerListPDFProps = {
  volunteers: VolunteerListRow[]
  filters: string
  generatedAt: string
}

export default function VolunteerListPDF({
  volunteers,
  filters,
  generatedAt,
}: VolunteerListPDFProps) {
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View>
          <Text style={styles.logoText}>30 By Ninety Theatre</Text>
          <Text style={styles.title}>Volunteer List</Text>
          <Text style={styles.generated}>Generated {generatedAt} CT</Text>
          {filters && <Text style={styles.filters}>Filters: {filters}</Text>}
        </View>

        <View style={styles.table}>
          <View style={[styles.row, styles.headerRow]} fixed>
            <Text style={[styles.headerCell, styles.colName]}>Full Name</Text>
            <Text style={[styles.headerCell, styles.colEmail]}>Email</Text>
            <Text style={[styles.headerCell, styles.colPhone]}>Phone</Text>
            <Text style={[styles.headerCell, styles.colServiceHours]}>Svc Hrs</Text>
            <Text style={[styles.headerCell, styles.colCategories]}>Categories</Text>
            <Text style={[styles.headerCell, styles.colHours]}>Hours</Text>
            <Text style={[styles.headerCell, styles.colCalls]}>Calls</Text>
            <Text style={[styles.headerCell, styles.colStatus]}>Status</Text>
            <Text style={[styles.headerCell, styles.colJoined]}>Joined</Text>
          </View>

          {volunteers.map((v, i) => (
            <View
              key={v.id}
              style={[styles.row, i % 2 === 0 ? styles.rowWhite : styles.rowShaded]}
            >
              <Text style={[styles.cell, styles.colName]}>{v.full_name}</Text>
              <Text style={[styles.cell, styles.colEmail]}>{v.email}</Text>
              <Text style={[styles.cell, styles.colPhone]}>{v.phone}</Text>
              <Text style={[styles.cell, styles.colServiceHours]}>
                {v.requires_service_hours ? 'Yes' : 'No'}
              </Text>
              <Text style={[styles.cell, styles.colCategories]}>
                {v.categories.map((c) => c.name).join(', ')}
              </Text>
              <Text style={[styles.cell, styles.colHours]}>{v.total_hours}</Text>
              <Text style={[styles.cell, styles.colCalls]}>{v.calls}</Text>
              <Text style={[styles.cell, styles.colStatus]}>
                {v.status === 'active' ? 'Active' : 'Archived'}
              </Text>
              <Text style={[styles.cell, styles.colJoined]}>
                {formatCT(v.created_at, 'MMM d, yyyy')}
              </Text>
            </View>
          ))}
        </View>

        <Text
          style={styles.footer}
          fixed
          render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
        />
      </Page>
    </Document>
  )
}
