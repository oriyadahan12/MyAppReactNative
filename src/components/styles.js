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


//ChildCard:
          card: {
            alignItems: "center",
            padding: 20,
            backgroundColor: "white",
            borderRadius: 10,
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowRadius: 10,
            width: "100%",
          },
          image: {
            width: 120,
            height: 120,
            borderRadius: 60,
          },
          placeholder: {
            width: 120,
            height: 120,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#f3f4f6",
            borderRadius: 60,
          },
          name: {
            fontSize: 22,
            fontWeight: "bold",
            marginVertical: 10,
            color: "rgba(134, 26, 7, 0.81)"
          },
        
          cardText:{
            fontSize: 16,
            fontWeight: "bold",
            marginVertical: 2,
            color: "rgb(102, 23, 102)"
          },
          // כפתורים מסביב לכרטיס
          buttonContainer: {
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "center",
            marginTop: 20,
            width: "100%",
          },
          roundButton: {
            width: 90,
            height: 90,
            borderRadius: 50,
            backgroundColor:'rgb(175, 138, 175)', 
            alignItems: "center",
            justifyContent: "center",
            margin: 10,
            shadowColor: "#000",
            shadowOpacity: 0.2,
            shadowRadius: 5,
            elevation: 5,
          },
          buttonText: {
            color: "#fff",
            fontSize: 13,
            marginTop: 5,
            textAlign: "center",
          },


        //MileStones, DoctorVisits

                  });

  export default styles;
