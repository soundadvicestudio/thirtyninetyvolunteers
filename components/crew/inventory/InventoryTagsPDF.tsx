import 'server-only'
import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer'

const DEFAULT_BRAND_PRIMARY = '#293994'
const DEFAULT_BRAND_PRIMARY_LIGHT = '#EEF1FA'

// StyleSheet.create() must be called with the resolved brand colors, not
// module-level constants — this component's colors come from app_settings
// (30BN-THEME.4) and are only known once the route handler resolves them
// and passes them in as props, at render time. Never call StyleSheet.create()
// at module scope — it freezes values before props are available.
function createStyles(brandPrimary = DEFAULT_BRAND_PRIMARY, brandPrimaryLight = DEFAULT_BRAND_PRIMARY_LIGHT) {
  return StyleSheet.create({
    page: {
      padding: 24,
      backgroundColor: '#ffffff',
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    tag: {
      width: '47%',
      border: '1px solid #D0D5E8',
      borderRadius: 4,
      padding: 12,
      backgroundColor: brandPrimaryLight,
    },
    tagHeader: {
      backgroundColor: brandPrimary,
      padding: 6,
      marginBottom: 8,
      borderRadius: 2,
    },
    itemNumber: {
      color: '#ffffff',
      fontSize: 11,
      fontFamily: 'Courier',
      fontWeight: 'bold',
    },
    itemName: {
      fontSize: 10,
      color: '#1A1A1A',
      marginBottom: 4,
      fontWeight: 'bold',
    },
    categoryName: {
      fontSize: 8,
      color: '#555555',
      marginBottom: 8,
    },
    qrContainer: {
      alignItems: 'center',
      backgroundColor: '#ffffff',
      padding: 8,
      borderRadius: 2,
    },
    qrImage: {
      width: 100,
      height: 100,
    },
  })
}

export type InventoryTag = {
  id: string
  item_number: string
  name: string
  category_name: string
  pngBase64: string // QR code PNG, no data: prefix
}

export type InventoryTagsPDFProps = {
  tags: InventoryTag[]
  brandPrimary?: string
  brandPrimaryLight?: string
}

export default function InventoryTagsPDF({
  tags,
  brandPrimary = DEFAULT_BRAND_PRIMARY,
  brandPrimaryLight = DEFAULT_BRAND_PRIMARY_LIGHT,
}: InventoryTagsPDFProps) {
  const styles = createStyles(brandPrimary, brandPrimaryLight)

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.grid}>
          {tags.map((tag) => (
            <View key={tag.id} style={styles.tag}>
              <View style={styles.tagHeader}>
                <Text style={styles.itemNumber}>{tag.item_number}</Text>
              </View>
              <Text style={styles.itemName}>{tag.name}</Text>
              <Text style={styles.categoryName}>{tag.category_name}</Text>
              <View style={styles.qrContainer}>
                {
                  // eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer's Image is a PDF-rendering primitive, not an HTML <img>; it has no alt prop
                  <Image style={styles.qrImage} src={`data:image/png;base64,${tag.pngBase64}`} />
                }
              </View>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  )
}
