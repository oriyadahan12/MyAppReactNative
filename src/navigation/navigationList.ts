export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Family: { familyUsername: string; personalUsername: string }; // הוספת הפרמטרים הנדרשים
  UpdateDetails: { familyUsername: string, personalUsername: string}
  AddChild: {familyUsername: string;};
  ChildCard: {childId: string};
  MileStones: {childId: string};
  UpdateChild: {childId: string};
  DoctorVisits: {childId: string};

  // הוסיפי מסכים נוספים כאן
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
