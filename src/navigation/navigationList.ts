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
  Vacinations: {childId: string};
  DropOfMilk: {childId: string};
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
