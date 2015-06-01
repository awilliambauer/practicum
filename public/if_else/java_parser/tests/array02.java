public class array02 {

    public static void mystery(int[] list) {
        for (int i = 1; i < list.length; i++) {
            list[i] = list[i] + list[i - 1];
        }
    }

}

