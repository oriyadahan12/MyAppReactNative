import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  background: { 
    flex: 1, 
    resizeMode: "cover", 
    width: "110%",  // שינוי מ-110% ל-100%
    height: "110%", // שינוי מ-110% ל-100%
    position: 'absolute', // תמנע מהתמונה לזוז עם הגלילה
    top: 0, // הצבה למעלה
    left: 0, // הצבה לשמאל
  },

    container: { 
      padding: 16,
      backgroundColor: "rgba(253, 251, 253, 0.5)", 
      flex: 1, borderRadius: 20, 
      margin: 10,
    },

    header: {
      fontSize: 24,
      fontWeight: 'bold',
      color: "rgba(172, 80, 64, 0.56)", 
      marginBottom: 16,
      textAlign: 'center',
      textShadowColor: 'rgba(54, 52, 52, 0.23)', // צבע הצל
      textShadowOffset: { width: 2, height: 2 }, // כיוון וגודל הצל
      textShadowRadius: 4, // טשטוש הצל
    },

    button: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(77, 3, 77, 0.8)", padding: 10, borderRadius: 16, justifyContent: "center", marginBottom: 8 },

    stageContainer: {
      marginBottom: 16,
      padding: 12,
      borderRadius: 8,
      backgroundColor: '#ffffff',
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 5,
      elevation: 3,
    },
    stageTitle: {
      fontWeight: 'bold',
      fontSize: 18,
      color: '#007acc',
      marginBottom: 8,
    },
    editContainer: {
      marginTop: 8,
      backgroundColor: '#f0f8ff',
      borderRadius: 8,
      padding: 10,
    },
    textInput: {
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 5,
      padding: 10,
      marginVertical: 8,
      backgroundColor: '#fff',
    },
    buttonRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 8,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: 20,
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 10,
      backgroundColor: '#007acc',
      borderRadius: 8,
    },
    logoutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 10,
      backgroundColor: '#e57373',
      borderRadius: 8,
    },
    preview: {
      width: '100%',
      height: 200,
      alignSelf: 'center',
      marginBottom: 15,
      borderRadius: 10,
    },
    addButton: {
      backgroundColor: '#007acc',
      padding: 12,
      borderRadius: 8,
      marginTop: 8,
    },
    addButtonText: {
      color: '#fff',
      textAlign: 'center',
      fontSize: 16,
      fontWeight: 'bold',
    },
    activeStage: {
      backgroundColor: '#f0f0f0',
    },
    dragHandle: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    listContainer: {
      padding: 16,
    },
    item: {
        padding: 20,
        marginVertical: 8,
        marginHorizontal: 16,
      },
  });
  
  export default styles;
