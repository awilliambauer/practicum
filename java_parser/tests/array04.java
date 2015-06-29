public class array04 {
    public static void mystery(int[] list) {
        for (int i = 2; i < list.length; i++) {
            list[i] = list[i] - list[i - 1];
        }
    }
}

