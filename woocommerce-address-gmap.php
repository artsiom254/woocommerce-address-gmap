<?php
/* Plugin Name: Address Google Map
 * Description: Add Google Map to address
 * Version:     0.1
 */
add_shortcode( 'map_address',
    function ( $atts ) {
        $atts = shortcode_atts( array(
            'height' => "400px",
            'width' => "100%",
            'show_map' => '1',
            'key' => 'AIzaSyC5lRejauJ_c1cSzrM5SbPNStNOpiwsXNY',
        ), $atts, 'map_address' );
        $width = $atts['width'];
        $height = $atts['height'];
        $show_map = $atts['show_map'];
        $key = $atts['key'];
        if ($show_map == '1'){
            $html =  '<style>
              #map_address {  
                width: '.$width.';  
                height: '.$height.';
                margin: 10px 0;
              }  
              #pac-input {
                background-color: #fff;
                font-family: Roboto;
                font-size: 15px;
                font-weight: 300;
                margin-left: 12px;
                padding: 0 11px 0 13px;
                text-overflow: ellipsis;
                width: 300px;
              }
              .controls {
                position: absolute;
                z-index: 5;
                left: 50%;
                margin-top: 20px;
                border: 1px solid transparent;
                border-radius: 2px 0 0 2px;
                box-sizing: border-box;
                -moz-box-sizing: border-box;
                height: 32px;
                outline: none;
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
              }</style>';
                    $html .= '<input id="pac-input" class="controls" type="text" placeholder="'.__('Enter a location','woocommerce-address-gmap').'">';
                    $html .= '<div id="map_address"></div>';
                }
                wp_enqueue_script( 'address-map-google',  plugin_dir_url(__FILE__).'/js/google-functions.js' , array( ), '1.0', true );
                wp_enqueue_script( 'p-gmaps','https://maps.google.com/maps/api/js?key='.$key.'&callback=initMap&libraries=places', array( ), '1.0', true );
                return $html;
    }
);

add_action( 'woocommerce_settings_general_options_after', function(){
    woocommerce_admin_fields( array(
        array(
            'name' => __( 'Post Code', 'woocommerce-new-label' ),
            'type' => 'title',
            'id' => 'wc_postcode_options'
        ),
        array(
            'name' 		=> __( 'Delete postcode', 'woocommerce-new-label' ),
            'desc' 		=> __( 'Remove postcode from address pages', 'woocommerce-new-label' ),
            'id' 		=> 'wc_postcode_del',
            'type' 		=> 'checkbox',
        ),
        array( 'type' => 'sectionend', 'id' => 'wc_postcode_options' ),
    ) );
}, 20 );

add_action( 'woocommerce_update_options_general',  'save_post_code_admin_settings' );

function save_post_code_admin_settings(){
    woocommerce_update_options( array(
        array(
            'name' => __( 'Post Code', 'woocommerce-new-label' ),
            'type' => 'title',
            'id' => 'wc_postcode_options'
        ),
        array(
            'name' 		=> __( 'Delete postcode', 'woocommerce-new-label' ),
            'desc' 		=> __( 'Remove postcode from address pages', 'woocommerce-new-label' ),
            'id' 		=> 'wc_postcode_del',
            'type' 		=> 'checkbox',
        ),
        array( 'type' => 'sectionend', 'id' => 'wc_postcode_options' ),
    ) );
}

add_filter('woocommerce_default_address_fields', function ($address_fields){
    if (hide_postcode()){
        $address_fields['postcode']['required'] = false;
        $address_fields['postcode']['class'][] = 'hidden';
    }
    return $address_fields;
});
add_filter( 'woocommerce_billing_fields' , function ($address_fields){
    if (hide_postcode()) {
        $address_fields['billing_postcode']['required'] = false;
        $address_fields['billing_postcode']['class'][] = 'hidden';
    }
    return $address_fields;
} );
add_filter( 'woocommerce_shipping_fields' , function ($address_fields){
    if (hide_postcode()) {
        $address_fields['billing_postcode']['required'] = false;
        $address_fields['billing_postcode']['class'][] = 'hidden';
    }
    return $address_fields;
} );
add_filter('woocommerce_checkout_fields', function ($address_fields){
    //var_dump($address_fields);
    return $address_fields;
});

function hide_postcode(){
    if (get_option( 'wc_postcode_del' ) == 'yes'){
        return true;
    }else{
        return false;
    }
}